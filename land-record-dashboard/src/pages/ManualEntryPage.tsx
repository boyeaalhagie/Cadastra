import { useState } from "react";
import { PenLine } from "lucide-react";
import { Form8Document } from "../components/Form8Document";
import { MapBoundaryEditor } from "../components/MapBoundaryEditor";
import { MapBoundaryPreview } from "../components/MapBoundaryPreview";
import { LandBoundaryIcon } from "../components/LandBoundaryIcon";
import { addRecord, getRecords } from "../services/recordStorage";
import { logAction } from "../services/auditLog";
import type { CertificateFields, GeoJsonPolygon } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";
import { createRecordNumber } from "../utils/createRecordNumber";

interface ManualEntryPageProps {
  onSaved: () => void;
}

const outlineBtn: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 11,
  fontWeight: 500,
  background: "#fff",
  cursor: "pointer",
  color: "#111",
};

const solidBtn: React.CSSProperties = {
  borderRadius: 8,
  padding: "7px 16px",
  fontSize: 11,
  fontWeight: 500,
  background: "#000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export function ManualEntryPage({ onSaved }: ManualEntryPageProps) {
  const [fields, setFields] = useState<CertificateFields>(emptyCertificateFields);
  const [boundary, setBoundary] = useState<GeoJsonPolygon | undefined>(undefined);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  function saveManualRecord(status: "manual_draft" | "confirmed") {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const recordNumber = createRecordNumber();
    addRecord({
      id, recordNumber,
      source: "manual_entry", status, ocrStatus: "not_started",
      fields, boundary, createdAt: now, updatedAt: now,
    });
    logAction(
      status === "confirmed" ? "record_confirmed" : "record_updated",
      id, `${recordNumber} — manual entry`,
    );
    onSaved();
  }

  async function handleDownloadPdf() {
    const page1 = document.getElementById("form8-page1");
    const page2 = document.getElementById("form8-page2");
    if (!page1 || !page2) return;
    setGeneratingPdf(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"), import("html2canvas"),
      ]);
      const onclone = (_doc: Document, el: HTMLElement) => {
        el.querySelectorAll<HTMLElement>("input, textarea").forEach((inp) => { inp.style.background = "transparent"; });
        el.querySelectorAll<HTMLElement>("[data-html2canvas-ignore]").forEach((node) => { node.style.display = "none"; });
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
      pdf.save("form8_certificate.pdf");
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Toolbar + Land Boundary on same row ── */}
      <div
        className="no-print"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", width: "100%" }}
      >
        {/* Land Boundary */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "7px", background: "#fff",
        }}>
          <LandBoundaryIcon size={18} color="#111" strokeWidth={1.6} />
          <span style={{ fontWeight: 600, fontSize: 12 }}>Land Boundary</span>
          <button onClick={() => setShowMapEditor(true)} style={{ ...(boundary ? outlineBtn : solidBtn), padding: "5px 12px", fontSize: 11, marginLeft: 30, display: "flex", alignItems: "center", gap: 5 }}>
            <PenLine size={11} strokeWidth={2} />
            {boundary ? "Edit Boundary" : "Draw Boundary"}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11 }}>
          <button onClick={() => setFields(emptyCertificateFields)} style={outlineBtn}>Clear Form</button>
          <button onClick={() => window.print()} style={outlineBtn}>Print</button>
          <button onClick={handleDownloadPdf} disabled={generatingPdf} style={{ ...outlineBtn, opacity: generatingPdf ? 0.6 : 1 }}>
            {generatingPdf ? "Generating…" : "Download PDF"}
          </button>
          <button onClick={() => saveManualRecord("manual_draft")} style={outlineBtn}>Save Draft</button>
          <button onClick={() => saveManualRecord("confirmed")} style={solidBtn}>Save Record</button>
        </div>
      </div>

      {/* Boundary preview (only when boundary exists) */}
      {boundary && (
        <div className="no-print" style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <MapBoundaryPreview
            boundary={boundary}
            height={260}
            tooltip={[
              fields.applicantName || null,
              fields.landLocation || null,
            ].filter(Boolean).join("<br/>") || "New record"}
          />
        </div>
      )}



      {/* ── Document form ── */}
      <div
        id="form8-print-area"
        style={{ background: "#f3f4f6", padding: "24px", borderRadius: 12, border: "1px solid #e5e7eb" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}>
          <Form8Document fields={fields} onChange={setFields} />
        </div>
      </div>

      {showMapEditor && (
        <MapBoundaryEditor
          initial={boundary}
          existingBoundaries={getRecords()
            .filter(r => r.boundary)
            .map(r => ({ recordNumber: r.recordNumber, boundary: r.boundary! }))}
          onSave={(poly) => { setBoundary(poly); setShowMapEditor(false); }}
          onClose={() => setShowMapEditor(false)}
        />
      )}
    </div>
  );
}
