import { useState, useEffect } from "react";
import { LayoutDashboard, ScanLine, FilePen, Camera, Map } from "lucide-react";
import { useRef } from "react";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

function ChevronRight({ size = 13, strokeWidth = 16 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none">
      <polyline points="96 48 176 128 96 208" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}/>
    </svg>
  );
}

function GambiaMapHero() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      try {
        const res = await fetch("/gambia-boundary.geojson");
        if (cancelled) return;
        const geojson = await res.json();
        if (cancelled) return;

        L.geoJSON(geojson, {
          style: { color: "#475569", weight: 1.5, fillColor: "#cbd5e1", fillOpacity: 0.45 },
        }).addTo(map);


        map.setView([13.44, -14.8], 8.35);
        map.invalidateSize();
      } catch (e) {
        // fallback center if fetch fails
        map.setView([13.44, -14.8], 8.35);
        map.invalidateSize();
      }
    };

    // small delay ensures the container has dimensions in the DOM
    const t = setTimeout(init, 50);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e5e5", marginBottom: 36, position: "relative" }}>
      <div ref={mapRef} style={{ height: 240, width: "100%" }} />

      {/* Floating glass card — right side */}
      <div style={{
        position: "absolute", top: 10, right: 10, bottom: 10,
        width: 180,
        background: "rgba(255,255,255,0.55)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.8)",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        zIndex: 1000,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignSelf: "flex-start",
            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#2563eb",
            background: "rgba(239,246,255,0.8)", border: "1px solid rgba(191,219,254,0.6)",
            borderRadius: 20, padding: "3px 9px",
          }}>
            First in The Gambia
          </span>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            Land Records,<br/>Fully Digital.
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
            The Gambia's first end-to-end Certificate of Occupancy system.
          </p>
        </div>

        <button
          onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            marginTop: 16,
            padding: "7px 10px",
            borderRadius: 15,
            border: "none",
            background: "#0f172a",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Explore Features
          <svg width="11" height="11" viewBox="0 0 256 256" fill="none">
            <polyline points="96 48 176 128 96 208" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// Monochromatic slate palette
const C = { dark: "#0f172a", mid: "#475569", light: "#94a3b8", xlight: "#cbd5e1", w: "white" };
const SW = 1.5;

function DashboardIcon() {
  return (
    <svg width="56" height="52" viewBox="0 0 56 52" fill="none">
      {/* 3 stacked record cards */}
      <rect x="16" y="2" width="34" height="20" rx="4" fill={C.light} stroke={C.dark} strokeWidth={SW}/>
      <rect x="10" y="10" width="34" height="20" rx="4" fill={C.xlight} stroke={C.dark} strokeWidth={SW}/>
      <rect x="4" y="18" width="34" height="22" rx="4" fill={C.w} stroke={C.dark} strokeWidth={SW}/>
      <rect x="10" y="25" width="18" height="2.5" rx="1.25" fill={C.mid}/>
      <rect x="10" y="30" width="12" height="2.5" rx="1.25" fill={C.light}/>
      <rect x="10" y="35" width="15" height="2.5" rx="1.25" fill={C.light}/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
      {/* Body */}
      <rect x="4" y="12" width="48" height="32" rx="7" fill={C.xlight} stroke={C.dark} strokeWidth={SW}/>
      {/* Viewfinder bump */}
      <rect x="19" y="6" width="18" height="9" rx="3.5" fill={C.light} stroke={C.dark} strokeWidth={SW}/>
      {/* Lens rings */}
      <circle cx="28" cy="28" r="11" fill={C.w} stroke={C.dark} strokeWidth={SW}/>
      <circle cx="28" cy="28" r="7" fill={C.light} stroke={C.dark} strokeWidth={SW}/>
      <circle cx="28" cy="28" r="3.5" fill={C.dark}/>
      {/* Flash dot */}
      <circle cx="44" cy="20" r="2.5" fill={C.mid}/>
    </svg>
  );
}

function OcrIcon() {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
      {/* Document with folded corner */}
      <path d="M4 4 L30 4 L44 18 L44 52 Q44 54 42 54 L6 54 Q4 54 4 52 Z" fill={C.w} stroke={C.dark} strokeWidth={SW} strokeLinejoin="round"/>
      <path d="M30 4 L30 18 L44 18" fill={C.xlight} stroke={C.dark} strokeWidth={SW} strokeLinejoin="round"/>
      {/* Text lines */}
      <rect x="10" y="24" width="24" height="2.5" rx="1.25" fill={C.light}/>
      <rect x="10" y="30" width="18" height="2.5" rx="1.25" fill={C.light}/>
      {/* Scan bar */}
      <rect x="4" y="36" width="40" height="7" rx="0" fill={C.xlight}/>
      <line x1="4" y1="36" x2="44" y2="36" stroke={C.mid} strokeWidth="1.5"/>
      <rect x="10" y="38.5" width="28" height="2.5" rx="1.25" fill={C.mid}/>
      <rect x="10" y="47" width="16" height="2.5" rx="1.25" fill={C.xlight}/>
    </svg>
  );
}

function FormIcon() {
  return (
    <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
      {/* Document */}
      <rect x="4" y="4" width="36" height="48" rx="4" fill={C.w} stroke={C.dark} strokeWidth={SW}/>
      {/* Header bar */}
      <rect x="4" y="4" width="36" height="12" rx="4" fill={C.xlight} stroke={C.dark} strokeWidth={SW}/>
      <rect x="4" y="10" width="36" height="6" fill={C.xlight}/>
      {/* Form lines */}
      <rect x="10" y="22" width="24" height="2.5" rx="1.25" fill={C.light}/>
      <rect x="10" y="28" width="20" height="2.5" rx="1.25" fill={C.light}/>
      <rect x="10" y="34" width="22" height="2.5" rx="1.25" fill={C.light}/>
      <rect x="10" y="40" width="16" height="2.5" rx="1.25" fill={C.xlight}/>
      {/* Pen */}
      <g transform="translate(28, 30) rotate(-40)">
        <rect x="-3" y="-14" width="6" height="16" rx="1.5" fill={C.dark}/>
        <polygon points="-3,2 3,2 0,7" fill={C.mid}/>
        <rect x="-3" y="-18" width="6" height="5" rx="1" fill={C.mid}/>
      </g>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="56" height="52" viewBox="0 0 56 52" fill="none">
      {/* Folded map */}
      <path d="M4 8 L20 4 L36 8 L52 4 L52 40 L36 44 L20 40 L4 44 Z" fill={C.xlight} stroke={C.dark} strokeWidth={SW} strokeLinejoin="round"/>
      {/* Fold lines */}
      <line x1="20" y1="4" x2="20" y2="40" stroke={C.light} strokeWidth={SW}/>
      <line x1="36" y1="8" x2="36" y2="44" stroke={C.light} strokeWidth={SW}/>
      {/* Location pin */}
      <path d="M28 10 C23 10 19 14 19 19 C19 25 28 36 28 36 C28 36 37 25 37 19 C37 14 33 10 28 10 Z" fill={C.dark} stroke={C.dark} strokeWidth={SW} strokeLinejoin="round"/>
      <circle cx="28" cy="19" r="4" fill={C.w}/>
    </svg>
  );
}

const cards = [
  { id: "dashboard", Icon: LayoutDashboard, IllusIcon: DashboardIcon, title: "Dashboard",       description: "View and manage all digitized records. Track status, search entries, and confirm reviewed records.", action: "Open Dashboard" },
  { id: "camera",    Icon: Camera,          IllusIcon: CameraIcon,    title: "Camera Capture",  description: "Use your phone to photograph a paper certificate. Scan the QR code, take a photo, and run OCR automatically.",           action: "Open Camera"    },
  { id: "upload",    Icon: ScanLine,        IllusIcon: OcrIcon,       title: "Upload + OCR",    description: "Upload a scanned certificate image or PDF. OCR extracts the text — review and correct the fields side by side.",          action: "Start OCR"      },
  { id: "manual",    Icon: FilePen,         IllusIcon: FormIcon,      title: "Manual Template", description: "Fill in a blank Certificate of Occupancy Form 8 directly on the document. Save as draft, confirm, or print.",             action: "Open Form"      },
  { id: "map-view",  Icon: Map,             IllusIcon: MapIcon,       title: "Map View",        description: "View all recorded land boundaries on a cadastral map. Color-coded by status — zoom in to inspect individual plots.",      action: "Open Map"       },
];

const navSections = [
  { id: "overview",        label: "Overview"        },
  { id: "features",        label: "Features"        },
  { id: "getting-started", label: "Getting Started" },
  { id: "workflow",        label: "Workflow"        },
];

const steps = [
  { n: "01", title: "Capture or upload",  desc: "Use your phone camera, upload a scanned image, or fill in the form manually." },
  { n: "02", title: "Review fields",      desc: "OCR extracts certificate fields automatically. Correct any errors side by side." },
  { n: "03", title: "Confirm & save",     desc: "Draw the land boundary on the map, confirm the record, and it's digitized." },
];

const workflowItems = [
  "Paper certificate", "OCR extraction", "Field review", "Map boundary", "Confirmed record",
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Overview */}
        <div id="overview" style={{ marginBottom: 48 }}>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Certificate of Occupancy</h2>
            <p className="mt-1 text-sm text-neutral-500 pb-6">Land-record digitization system for Form 8</p>
          </div>
          <GambiaMapHero />
        </div>

        {/* Features */}
        <div id="features" style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: "#111", display: "flex", alignItems: "center", gap: 6 }}>Features
            <a href="#features" style={{ color: "#d4d4d4", textDecoration: "none", fontSize: 13, fontWeight: 400 }}>#</a>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {cards.map(({ id, IllusIcon, title, description, action }) => (
              <div
                key={id}
                onClick={() => onNavigate(id)}
                style={{ borderRadius: 14, background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden", transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => {
                  const c = e.currentTarget.querySelector<HTMLElement>(".card-chevron");
                  if (c) c.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  const c = e.currentTarget.querySelector<HTMLElement>(".card-chevron");
                  if (c) c.style.transform = "translateX(0)";
                }}
              >
                <div style={{ height: 110, background: "#e8edf5", backgroundImage: "radial-gradient(circle, #a8b8cc 0.75px, transparent 0.75px)", backgroundSize: "11px 11px", borderRadius: 14, border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IllusIcon />
                </div>
                <div style={{ padding: "14px 0px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#737373", lineHeight: 1.6, flex: 1 }}>{description}</div>
                  <span style={{ marginTop: 4, fontSize: 12, color: "#000", display: "flex", alignItems: "center", gap: 4 }}>
                    {action}
                    <span className="card-chevron" style={{ display: "flex", transition: "transform 0.2s ease" }}>
                      <ChevronRight size={12} strokeWidth={22} />
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div id="getting-started" style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: "#111", display: "flex", alignItems: "center", gap: 6 }}>Getting Started
            <a href="#getting-started" style={{ color: "#d4d4d4", textDecoration: "none", fontSize: 13, fontWeight: 400 }}>#</a>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", gap: 14, padding: "14px 18px", border: "1px solid #e5e5e5", borderRadius: 10, background: "#fff" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a3a3a3", fontFamily: "monospace", minWidth: 22, paddingTop: 2 }}>{n}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#737373", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div id="workflow">
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px", color: "#111", display: "flex", alignItems: "center", gap: 6 }}>Workflow
            <a href="#workflow" style={{ color: "#d4d4d4", textDecoration: "none", fontSize: 13, fontWeight: 400 }}>#</a>
          </h2>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, padding: "18px", border: "1px solid #e5e5e5", borderRadius: 10, background: "#fff" }}>
            {workflowItems.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#374151", background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 6, padding: "4px 10px", whiteSpace: "nowrap" }}>
                  {label}
                </div>
                {i < workflowItems.length - 1 && <ChevronRight size={11} strokeWidth={20} />}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── On this page (sticky right column) ── */}
      <div style={{ width: 160, flexShrink: 0, position: "sticky", top: 0 }}>
        <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#737373"}}>
          On this page
        </p>
        <div style={{ display: "flex", flexDirection: "column", borderLeft: "1.5px solid #e5e5e5" }}>
          {navSections.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  textAlign: "left", background: "none", cursor: "pointer",
                  fontSize: 13, fontFamily: "system-ui, sans-serif",
                  padding: "5px 0 5px 12px",
                  border: "none",
                  borderLeft: isActive ? "1.5px solid #057dcd" : "1.5px solid transparent",
                  marginLeft: -1.5,
                  color: isActive ? "#057dcd" : "#737373",
                  transition: "color 0.15s, border-color 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#057dcd"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isActive ? "#057dcd" : "#737373"; }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
