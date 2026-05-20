import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GeoJsonPolygon } from "../types/certificate";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

export interface ExistingBoundary {
  recordNumber: string;
  boundary: GeoJsonPolygon;
}

interface Props {
  initial?: GeoJsonPolygon;
  existingBoundaries?: ExistingBoundary[];
  onSave: (polygon: GeoJsonPolygon | undefined) => void;
  onClose: () => void;
}

// ── Polygon overlap detection (no external deps) ──────────────────────────────

function pointInRing(pt: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function segmentsIntersect(
  a1: [number, number], a2: [number, number],
  b1: [number, number], b2: [number, number],
): boolean {
  const dx1 = a2[0] - a1[0], dy1 = a2[1] - a1[1];
  const dx2 = b2[0] - b1[0], dy2 = b2[1] - b1[1];
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-12) return false;
  const t = ((b1[0] - a1[0]) * dy2 - (b1[1] - a1[1]) * dx2) / denom;
  const u = ((b1[0] - a1[0]) * dy1 - (b1[1] - a1[1]) * dx1) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function ringsOverlap(r1: number[][], r2: number[][]): boolean {
  const p1 = r1.map(c => [c[0], c[1]] as [number, number]);
  const p2 = r2.map(c => [c[0], c[1]] as [number, number]);
  for (const pt of p1.slice(0, -1)) if (pointInRing(pt, p2)) return true;
  for (const pt of p2.slice(0, -1)) if (pointInRing(pt, p1)) return true;
  for (let i = 0; i < p1.length - 1; i++)
    for (let j = 0; j < p2.length - 1; j++)
      if (segmentsIntersect(p1[i], p1[i + 1], p2[j], p2[j + 1])) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────

export function MapBoundaryEditor({
  initial,
  existingBoundaries = [],
  onSave,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnLayerRef = useRef<any>(null);
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map: any;

    const el = containerRef.current!;
    const blockPinch = (e: WheelEvent) => { if (e.ctrlKey) e.preventDefault(); };
    el.addEventListener("wheel", blockPinch, { passive: false });

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet-draw");
      if (cancelled) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(el, { touchZoom: true, scrollWheelZoom: true }).setView([13.3895, -16.6790], 12);

      // ── Tile layers ──────────────────────────────────────────────────────────
      const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri, Maxar, Earthstar Geographics", maxZoom: 19 },
      );
      const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap contributors", maxZoom: 17,
      });

      // Default: street view
      street.addTo(map);

      const layerControl = L.control.layers(
        { "Street": street, "Satellite": satellite, "Terrain": topo },
        {},
        { position: "topright" },
      ).addTo(map);

      // Auto-switch: street below zoom 16, satellite at zoom 16+
      let autoActive = true; // user hasn't manually changed layer yet
      layerControl.getContainer()?.addEventListener("click", () => { autoActive = false; });

      map.on("zoomend", () => {
        if (!autoActive) return;
        const z = map.getZoom();
        if (z >= 16 && map.hasLayer(street)) {
          map.removeLayer(street);
          map.addLayer(satellite);
        } else if (z < 16 && map.hasLayer(satellite)) {
          map.removeLayer(satellite);
          map.addLayer(street);
        }
      });

      // ── Existing (other records) boundaries ──────────────────────────────────
      existingBoundaries.forEach(({ recordNumber, boundary }) => {
        L.geoJSON(boundary as any, {
          style: { color: "#6b7280", weight: 1.5, fillColor: "#9ca3af", fillOpacity: 0.18, dashArray: "5 4" },
        })
          .bindTooltip(recordNumber, { sticky: true, className: "" })
          .addTo(map);
      });

      // ── Editable layer (this record's boundary) ──────────────────────────────
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      if (initial) {
        const layer = L.geoJSON(initial as any, {
          style: { color: "#2563eb", weight: 2.5, fillColor: "#3b82f6", fillOpacity: 0.18 },
        });
        layer.eachLayer((l: any) => {
          drawnItems.addLayer(l);
          drawnLayerRef.current = l;
        });
        map.fitBounds(drawnItems.getBounds(), { padding: [40, 40] });
      }

      const drawControl = new (L.Control as any).Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: { shapeOptions: { color: "#2563eb", weight: 2.5, fillColor: "#3b82f6", fillOpacity: 0.18 } },
          polyline: false, rectangle: false, circle: false, circlemarker: false, marker: false,
        },
      });
      map.addControl(drawControl);

      // ── Overlap check ────────────────────────────────────────────────────────
      function findConflict(layer: any): string | null {
        const ring: number[][] = layer.toGeoJSON().geometry.coordinates[0];
        for (const { recordNumber, boundary } of existingBoundaries) {
          if (ringsOverlap(ring, boundary.coordinates[0])) return recordNumber;
        }
        return null;
      }

      map.on((L as any).Draw.Event.CREATED, (e: any) => {
        const conflict = findConflict(e.layer);
        if (conflict) {
          toast.error(`Boundary overlaps with record ${conflict}`, {
            description: "Redraw the boundary to avoid the existing parcel.",
            duration: 5000,
          });
          setHasConflict(true);
          return; // do NOT add the layer
        }
        setHasConflict(false);
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
        drawnLayerRef.current = e.layer;
      });

      map.on((L as any).Draw.Event.EDITED, (e: any) => {
        let conflict: string | null = null;
        e.layers.eachLayer((l: any) => {
          if (!conflict) conflict = findConflict(l);
          drawnLayerRef.current = l;
        });
        if (conflict) {
          toast.error(`Boundary overlaps with record ${conflict}`, {
            description: "Edit the boundary again to fix the overlap.",
            duration: 5000,
          });
          setHasConflict(true);
        } else {
          setHasConflict(false);
        }
      });

      map.on((L as any).Draw.Event.DELETED, () => {
        drawnLayerRef.current = null;
        setHasConflict(false);
      });
    })();

    return () => {
      cancelled = true;
      el.removeEventListener("wheel", blockPinch);
      map?.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (hasConflict) return;
    if (!drawnLayerRef.current) { onSave(undefined); return; }
    onSave(drawnLayerRef.current.toGeoJSON().geometry as GeoJsonPolygon);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 14, overflow: "hidden",
        width: "min(900px, 100%)", height: "min(620px, 90vh)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
      }}>
        {/* Header */}
        <div style={{
          padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>Draw Land Boundary</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Polygon tool · top-left toolbar · Grey = existing parcels
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", lineHeight: 1 }}>×</button>
        </div>

        {/* Map */}
        <div ref={containerRef} style={{ flex: 1, touchAction: "none" }} />

        {/* Footer */}
        <div style={{
          padding: "10px 16px", borderTop: "1px solid #e5e7eb",
          display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0,
        }}>
          <button
            onClick={() => onSave(undefined)}
            style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, background: "#fff", cursor: "pointer", color: "#b91c1c" }}
          >
            Clear Boundary
          </button>
          <button
            onClick={onClose}
            style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, background: "#fff", cursor: "pointer", color: "#111" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={hasConflict}
            style={{
              borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500,
              background: hasConflict ? "#9ca3af" : "#000",
              color: "#fff", border: "none",
              cursor: hasConflict ? "not-allowed" : "pointer",
            }}
          >
            Save Boundary
          </button>
        </div>
      </div>
    </div>
  );
}
