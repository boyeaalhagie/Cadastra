import { useState } from "react";
import { Files, CircleCheck, Clock, FilePen, MapPin } from "lucide-react";
import type { CertificateRecord } from "../types/certificate";

interface DashboardPageProps {
  records: CertificateRecord[];
  onOpenRecord: (id: string) => void;
}

function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const r = 52;
  const cx = 65;
  const cy = 65;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f5" strokeWidth="20"/>
      {total > 0 && segments.filter(s => s.value > 0).map((seg, i) => {
        const pct = seg.value / total;
        const len = pct * circumference;
        const offset = circumference * 0.25 - cumulative;
        cumulative += len;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="20"
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={offset}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#111" fontFamily="system-ui">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#a3a3a3" fontFamily="system-ui">total</text>
    </svg>
  );
}

export function DashboardPage({ records, onOpenRecord }: DashboardPageProps) {
  const confirmed    = records.filter((r) => r.status === "confirmed").length;
  const needsReview  = records.filter((r) => r.status === "ocr_extracted_needs_review").length;
  const manual       = records.filter((r) => r.source === "manual_entry").length;
  const drafts       = records.filter((r) => r.status === "manual_draft").length;
  const withBoundary = records.filter((r) => r.boundary).length;
  const ocrUploads   = records.filter((r) => r.source === "ocr_upload").length;

  const statCards = [
    { label: "Total Records",   value: records.length,    Icon: Files        },
    { label: "Confirmed",       value: confirmed,         Icon: CircleCheck  },
    { label: "Needs Review",    value: needsReview,       Icon: Clock        },
    { label: "Manual / Drafts", value: manual + drafts,   Icon: FilePen      },
    { label: "With Boundary",   value: withBoundary,      Icon: MapPin       },
  ];

  const donutSegments = [
    { value: confirmed,   color: "#111",    label: "Confirmed",    sub: `${records.length > 0 ? Math.round(confirmed / records.length * 100) : 0}%` },
    { value: needsReview, color: "#f59e0b", label: "Needs Review", sub: `${records.length > 0 ? Math.round(needsReview / records.length * 100) : 0}%` },
    { value: drafts,      color: "#a3a3a3", label: "Draft",        sub: `${records.length > 0 ? Math.round(drafts / records.length * 100) : 0}%` },
    { value: ocrUploads,  color: "#3b82f6", label: "OCR Upload",   sub: `${records.length > 0 ? Math.round(ocrUploads / records.length * 100) : 0}%` },
  ];

  const recent = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  function statusLabel(status: CertificateRecord["status"]) {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "ocr_extracted_needs_review": return "Needs Review";
      case "manual_draft": return "Draft";
      default: return status;
    }
  }

  function statusBadgeStyle(status: CertificateRecord["status"]): React.CSSProperties {
    switch (status) {
      case "confirmed": return { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" };
      case "ocr_extracted_needs_review": return { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" };
      default: return { background: "#f5f5f5", color: "#737373", border: "1px solid #e5e5e5" };
    }
  }

  const ArrowBtn = () => (
    <button style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e5e5", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 256 256" fill="none">
        <polyline points="96 48 176 128 96 208" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"/>
      </svg>
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, Admin</h2>
        <p className="mt-1 text-sm text-neutral-500">Certificate of Occupancy digitization overview.</p>
      </div>

      {/* Stat bar */}
      <div className="flex divide-x divide-neutral-200 rounded-xl border border-neutral-200 shadow-xs bg-white overflow-hidden">
        {statCards.map(({ label, value, Icon }) => (
          <div key={label} className="flex-1 p-4 flex items-start gap-3">
            <Icon size={16} strokeWidth={1.8} className="text-neutral-400 shrink-0" />
            <div className="flex flex-col">
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="text-xl font-bold tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main analytics row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

        {/* Record Overview — donut + breakdown */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Record Overview</span>
            <ArrowBtn />
          </div>
          <div style={{ padding: "20px 24px", display: "flex", gap: 32, alignItems: "center" }}>
            {/* Breakdown list */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "0 0 4px", letterSpacing: "-0.03em" }}>{records.length}</p>
              <p style={{ fontSize: 12, color: "#a3a3a3", margin: "0 0 20px" }}>Total Records</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {donutSegments.map(({ label, value, color, sub }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111", fontFamily: "monospace" }}>{value}</span>
                    <span style={{ fontSize: 11, color: "#a3a3a3", minWidth: 32, textAlign: "right" }}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Donut chart */}
            <DonutChart segments={donutSegments} />
          </div>
        </div>

        {/* Recent Records — stepper/timeline */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Recent Records</span>
            <ArrowBtn />
          </div>
          <div style={{ padding: "16px 20px" }}>
            {recent.length === 0 ? (
              <p style={{ fontSize: 13, color: "#a3a3a3", textAlign: "center", padding: "20px 0" }}>No records yet.</p>
            ) : (
              recent.map((r, i) => (
                <div key={r.id} style={{ display: "flex", gap: 12 }}>
                  {/* Stepper indicator */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #e5e5e5", background: "#fff", flexShrink: 0, marginTop: 1 }}/>
                    {i < recent.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: "#e5e5e5", margin: "3px 0" }}/>
                    )}
                  </div>
                  {/* Content */}
                  <div
                    style={{ flex: 1, paddingBottom: i < recent.length - 1 ? 16 : 0, cursor: "pointer" }}
                    onClick={() => onOpenRecord(r.id)}
                  >
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#a3a3a3", marginBottom: 3 }}>
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#111", fontFamily: "monospace" }}>{r.recordNumber}</p>
                      <span style={{ fontSize: 9, color: "#d4d4d4" }}>·</span>
                      <span style={{ fontSize: 10, color: "#737373" }}>{r.source === "ocr_upload" ? "OCR Upload" : "Manual Entry"}</span>
                      <span style={{ fontSize: 9, color: "#d4d4d4" }}>·</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 20, ...statusBadgeStyle(r.status) }}>
                        {statusLabel(r.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e5e5" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>By Source</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {[
            { label: "OCR Upload",      value: ocrUploads,   bg: "#eff6ff", color: "#2563eb", abbr: "OCR" },
            { label: "Manual Entry",    value: manual,       bg: "#f0fdf4", color: "#16a34a", abbr: "MAN" },
            { label: "With Boundary",   value: withBoundary, bg: "#fafafa", color: "#374151", abbr: "MAP" },
          ].map(({ label, value, bg, color, abbr }, i) => (
            <div key={label} style={{ padding: "20px 24px", borderRight: i < 2 ? "1px solid #e5e5e5" : undefined, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.04em" }}>{abbr}</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "-0.02em" }}>{value}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a3a3a3" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
