import { useEffect, useRef } from "react";
import { getRecords } from "../services/recordStorage";
import type { CertificateRecord } from "../types/certificate";
import { polygonArea, formatArea } from "../utils/geoUtils";
import "leaflet/dist/leaflet.css";

interface Props {
  onOpenRecord: (id: string) => void;
}

function statusStyle(status: CertificateRecord["status"]) {
  switch (status) {
    case "confirmed":
      return { color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.25 };
    case "ocr_extracted_needs_review":
      return { color: "#ca8a04", fillColor: "#eab308", fillOpacity: 0.25 };
    default:
      return { color: "#6b7280", fillColor: "#9ca3af", fillOpacity: 0.2 };
  }
}

function statusLabel(status: CertificateRecord["status"]) {
  switch (status) {
    case "confirmed":                  return "Confirmed";
    case "ocr_extracted_needs_review": return "Needs Review";
    default:                           return "Draft";
  }
}

export function MapViewPage({ onOpenRecord }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: any;

    const el = containerRef.current;
    const blockPinch = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    el.addEventListener("wheel", blockPinch, { passive: false });

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(el, { touchZoom: true, scrollWheelZoom: true })
             .setView([13.3895, -16.6790], 12);

      // ── Tile layers ───────────────────────────────────────────────────────────
      const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri, Maxar, Earthstar Geographics", maxZoom: 19 },
      );

      street.addTo(map);

      const layerControl = L.control.layers(
        { "Street": street, "Satellite": satellite },
        {}, { position: "topright" },
      ).addTo(map);

      // Auto-switch street ↔ satellite at zoom 16
      let autoActive = true;
      layerControl.getContainer()?.addEventListener("click", () => { autoActive = false; });
      map.on("zoomend", () => {
        if (!autoActive) return;
        const z = map.getZoom();
        if (z >= 16 && map.hasLayer(street))    { map.removeLayer(street);    map.addLayer(satellite); }
        else if (z < 16 && map.hasLayer(satellite)) { map.removeLayer(satellite); map.addLayer(street); }
      });

      // ── Plot all records that have a boundary ────────────────────────────────
      const records = getRecords().filter((r) => r.boundary);

      records.forEach((record) => {
        const style = { ...statusStyle(record.status), weight: 2 };

        const layer = L.geoJSON(record.boundary as any, { style });

        const area = polygonArea(record.boundary!);

        layer.bindTooltip(
          `<div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.7">
            <strong>${record.recordNumber}</strong><br/>
            ${record.fields.applicantName ? `${record.fields.applicantName}<br/>` : ""}
            Area ~${Math.round(area).toLocaleString()} m²
          </div>`,
          { sticky: true, opacity: 0.95 },
        );

        layer.on("click", () => onOpenRecord(record.id));

        // Highlight on hover
        layer.on("mouseover", () => layer.setStyle({ ...style, fillOpacity: 0.45, weight: 3 }));
        layer.on("mouseout",  () => layer.setStyle({ ...style }));

        layer.addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      el.removeEventListener("wheel", blockPinch);
      map?.remove();
    };
  }, [onOpenRecord]);

  const records = getRecords();
  const withBoundary = records.filter((r) => r.boundary).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: 10 }}>

      {/* ── Legend + stats bar ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        padding: "8px 14px", background: "#fff",
        border: "1px solid #e5e7eb", borderRadius: 10, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Legend
        </span>

        {[
          { color: "#22c55e", border: "#16a34a", label: "Confirmed" },
          { color: "#eab308", border: "#ca8a04", label: "Needs Review" },
          { color: "#9ca3af", border: "#6b7280", label: "Draft" },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: color, border: `2px solid ${border}` }} />
            <span style={{ fontSize: 12, color: "#374151" }}>{label}</span>
          </div>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {withBoundary} of {records.length} records mapped
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Click a parcel to open record</span>
        </div>
      </div>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      {withBoundary === 0 ? (
        <div style={{
          flex: 1, border: "1px solid #e5e7eb", borderRadius: 12,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "#fafafa", gap: 8, color: "#9ca3af",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
            <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          <span style={{ fontSize: 13 }}>No boundaries mapped yet</span>
          <span style={{ fontSize: 11 }}>Open a record and draw its land boundary</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", touchAction: "none" }}
        />
      )}
    </div>
  );
}
