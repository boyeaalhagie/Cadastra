import type { GeoJsonPolygon } from "../types/certificate";

const R = 6371000; // Earth radius in metres
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Area in square metres using the spherical excess formula */
export function polygonArea(polygon: GeoJsonPolygon): number {
  const ring = polygon.coordinates[0];
  const n = ring.length - 1;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lng1 = rad(ring[i][0]), lat1 = rad(ring[i][1]);
    const lng2 = rad(ring[j][0]), lat2 = rad(ring[j][1]);
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((area * R * R) / 2);
}

/** Perimeter in metres (haversine between consecutive vertices) */
export function polygonPerimeter(polygon: GeoJsonPolygon): number {
  const ring = polygon.coordinates[0];
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    total += haversine(ring[i][1], ring[i][0], ring[i + 1][1], ring[i + 1][0]);
  }
  return total;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Centroid of the polygon ring */
export function polygonCentroid(polygon: GeoJsonPolygon): [number, number] {
  const ring = polygon.coordinates[0].slice(0, -1);
  const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
  const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
  return [lat, lng];
}

/** Human-readable area string */
export function formatArea(sqm: number): string {
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(2)} ha`;
  return `${Math.round(sqm).toLocaleString()} m²`;
}

/** Human-readable distance string */
export function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${Math.round(metres)} m`;
}
