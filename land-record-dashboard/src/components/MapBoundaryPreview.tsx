import { useEffect, useRef } from "react";
import type { GeoJsonPolygon } from "../types/certificate";
import "leaflet/dist/leaflet.css";

interface Props {
  boundary: GeoJsonPolygon;
  height?: number;
  tooltip?: string;
}

export function MapBoundaryPreview({ boundary, height = 220, tooltip }: Props) {
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

      map = L.map(el, { zoomControl: true, scrollWheelZoom: false, dragging: true, touchZoom: true });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri, Maxar, Earthstar Geographics", maxZoom: 19 },
      ).addTo(map);

      const layer = L.geoJSON(boundary as any, {
        style: { color: "#2563eb", weight: 2.5, fillColor: "#3b82f6", fillOpacity: 0.18 },
      });

      if (tooltip) {
        layer.bindTooltip(tooltip, { sticky: true, opacity: 0.95 });
      }

      layer.addTo(map);

      map.fitBounds(layer.getBounds(), { padding: [24, 24] });
    })();

    return () => {
      cancelled = true;
      el.removeEventListener("wheel", blockPinch);
      map?.remove();
    };
  }, [boundary]);

  return <div ref={containerRef} style={{ height, borderRadius: 8, overflow: "hidden", touchAction: "none" }} />;
}
