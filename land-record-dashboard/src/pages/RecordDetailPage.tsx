import { useState } from "react";
import { PenLine, ScanSearch } from "lucide-react";
import { LandBoundaryIcon } from "../components/LandBoundaryIcon";
import type { CertificateRecord, GeoJsonPolygon } from "../types/certificate";
import { Form8Document } from "../components/Form8Document";
import { MapBoundaryEditor } from "../components/MapBoundaryEditor";
import { MapBoundaryPreview } from "../components/MapBoundaryPreview";
import { updateRecord, deleteRecord, getRecords } from "../services/recordStorage";
import { logAction } from "../services/auditLog";
import { polygonArea, formatArea } from "../utils/geoUtils";

interface RecordDetailPageProps {
  record: CertificateRecord;
  onSaved: () => void;
  onBack: () => void;
}

const outlineBtn: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 500,
  background: "#fff",
  cursor: "pointer",
  color: "#111",
};

const solidBtn: React.CSSProperties = {
  borderRadius: 8,
  padding: "7px 16px",
  fontSize: 13,
  fontWeight: 500,
  background: "#000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  ...outlineBtn,
  color: "#b91c1c",
  borderColor: "#fca5a5",
};

export function RecordDetailPage({ record, onSaved, onBack }: RecordDetailPageProps) {
  const [fields, setFields] = useState(record.fields);
  const [boundary, setBoundary] = useState<GeoJsonPolygon | undefined>(record.boundary);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  function saveChanges() {
    updateRecord({ ...record, fields, boundary, updatedAt: new Date().toISOString() });
    logAction("record_updated", record.id, record.recordNumber);
    onSaved();
  }

  function confirmRecord() {
    updateRecord({ ...record, fields, boundary, status: "confirmed", updatedAt: new Date().toISOString() });
    logAction("record_confirmed", record.id, record.recordNumber);
    onSaved();
  }

  function handleDelete() {
    deleteRecord(record.id);
    logAction("record_deleted", record.id, record.recordNumber);
    onSaved();
  }

  function exportJson() {
    const data = {
      recordNumber: record.recordNumber,
      source: record.source,
      status: record.status,
      fields,
      rawOcrText: record.rawOcrText,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.recordNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPdf() {
    const page1 = document.getElementById("form8-page1");
    const page2 = document.getElementById("form8-page2");
    if (!page1 || !page2) return;
    setGeneratingPdf(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const onclone = (_doc: Document, el: HTMLElement) => {
        el.querySelectorAll<HTMLElement>("input, textarea").forEach((inp) => {
          inp.style.background = "transparent";
        });
        el.querySelectorAll<HTMLElement>("[data-html2canvas-ignore]").forEach((node) => {
          node.style.display = "none";
        });
      };
      const opts = { scale: 2, useCORS: true, onclone } as const;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const c1 = await html2canvas(page1, opts);
      pdf.addImage(c1.toDataURL("image/png"), "PNG", 0, 0, pageW, Math.min((c1.height / c1.width) * pageW, pageH));
      pdf.addPage();
      const c2 = await html2canvas(page2, opts);
      pdf.addImage(c2.toDataURL("image/png"), "PNG", 0, 0, pageW, Math.min((c2.height / c2.width) * pageW, pageH));
      pdf.save(`${record.recordNumber}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  }

  function statusLabel(status: CertificateRecord["status"]) {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "ocr_extracted_needs_review": return "Needs Review";
      case "manual_draft": return "Draft";
      default: return status;
    }
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <button
            onClick={onBack}
            style={{ fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}
          >
            ← Back to dashboard
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.02em", fontFamily: "monospace" }}>
            {record.recordNumber}
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {record.source === "ocr_upload" ? "OCR Upload" : "Manual Entry"}
            {" · "}
            {statusLabel(record.status)}
            {" · "}
            {new Date(record.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={dangerBtn}>
              Delete
            </button>
          ) : (
            <>
              <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>Delete permanently?</span>
              <button onClick={() => setShowDeleteConfirm(false)} style={outlineBtn}>Cancel</button>
              <button onClick={handleDelete} style={{ ...solidBtn, background: "#b91c1c" }}>Confirm Delete</button>
            </>
          )}

          <button onClick={exportJson} style={outlineBtn}>
            Export JSON
          </button>

          <button onClick={() => window.print()} style={outlineBtn}>
            Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            style={{ ...outlineBtn, opacity: generatingPdf ? 0.6 : 1 }}
          >
            {generatingPdf ? "Generating…" : "Download PDF"}
          </button>

          <button onClick={saveChanges} style={outlineBtn}>
            Save Changes
          </button>

          {record.status !== "confirmed" && (
            <button onClick={confirmRecord} style={solidBtn}>
              Confirm Record
            </button>
          )}
        </div>
      </div>

      {/* ── Land Boundary ── */}
      <div
        className="no-print"
        style={{
          border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20,
        }}
      >
        <div style={{
          padding: "10px 16px", borderBottom: boundary ? "1px solid #e5e7eb" : undefined,
          display: "flex", alignItems: "center", gap: 10,
          background: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
            {/* Land parcel polygon icon */}
            <LandBoundaryIcon size={20} color="#111" strokeWidth={1.6} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Land Boundary</span>
          </div>
          <button
            onClick={() => setShowMapEditor(true)}
            style={{ ...boundary ? outlineBtn : solidBtn, display: "flex", alignItems: "center", gap: 5 }}
          >
            {boundary
              ? <><ScanSearch size={12} strokeWidth={2} /> Edit Boundary</>
              : <><PenLine size={12} strokeWidth={2} /> Draw Boundary</>}
          </button>
        </div>
        {boundary && (
          <MapBoundaryPreview
            boundary={boundary}
            height={260}
            tooltip={[
              `<strong>${record.recordNumber}</strong>`,
              record.fields.applicantName || null,
              `Area ~${Math.round(polygonArea(boundary)).toLocaleString()} m²`,
            ].filter(Boolean).join("<br/>")}
          />
        )}
      </div>

      {/* ── Form 8 document ── */}
      <div
        id="form8-print-area"
        style={{
          background: "#f3f4f6",
          padding: "24px 0",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
          <Form8Document fields={fields} onChange={setFields} />
        </div>
      </div>

      {/* ── Map editor modal ── */}
      {showMapEditor && (
        <MapBoundaryEditor
          initial={boundary}
          existingBoundaries={getRecords()
            .filter(r => r.id !== record.id && r.boundary)
            .map(r => ({ recordNumber: r.recordNumber, boundary: r.boundary! }))}
          onSave={(poly) => { setBoundary(poly); setShowMapEditor(false); }}
          onClose={() => setShowMapEditor(false)}
        />
      )}
    </div>
  );
}
