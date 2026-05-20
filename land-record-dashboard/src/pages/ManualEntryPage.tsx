import { useState } from "react";
import { PenLine, ScanSearch } from "lucide-react";
import { LandBoundaryIcon } from "../components/LandBoundaryIcon";
import { Form8Document } from "../components/Form8Document";
import { MapBoundaryEditor } from "../components/MapBoundaryEditor";
import { MapBoundaryPreview } from "../components/MapBoundaryPreview";
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
      id,
      recordNumber,
      source: "manual_entry",
      status,
      ocrStatus: "not_started",
      fields,
      boundary,
      createdAt: now,
      updatedAt: now,
    });

    logAction(
      status === "confirmed" ? "record_confirmed" : "record_updated",
      id,
      `${recordNumber} — manual entry`,
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
        import("jspdf"),
        import("html2canvas"),
      ]);

      /* Strip highlight colour and ignore overlay elements in the clone */
      const onclone = (_doc: Document, el: HTMLElement) => {
        el.querySelectorAll<HTMLElement>("input, textarea").forEach((inp) => {
          inp.style.background = "transparent";
        });
        el.querySelectorAll<HTMLElement>("[data-html2canvas-ignore]").forEach(
          (node) => {
            node.style.display = "none";
          },
        );
      };

      const opts = { scale: 2, useCORS: true, onclone } as const;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      /* Page 1 */
      const c1 = await html2canvas(page1, opts);
      const h1 = Math.min((c1.height / c1.width) * pageW, pageH);
      pdf.addImage(c1.toDataURL("image/png"), "PNG", 0, 0, pageW, h1);

      /* Page 2 */
      pdf.addPage();
      const c2 = await html2canvas(page2, opts);
      const h2 = Math.min((c2.height / c2.width) * pageW, pageH);
      pdf.addImage(c2.toDataURL("image/png"), "PNG", 0, 0, pageW, h2);

      pdf.save("form8_certificate.pdf");
    } finally {
      setGeneratingPdf(false);
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
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>
            Manual Certificate Template
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Fill in the Form 8 fields directly on the document below.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setFields(emptyCertificateFields)} style={outlineBtn}>
            Clear Form
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

          <button onClick={() => saveManualRecord("manual_draft")} style={outlineBtn}>
            Save Draft
          </button>

          <button onClick={() => saveManualRecord("confirmed")} style={solidBtn}>
            Save Record
          </button>
        </div>
      </div>

      {/* ── Land Boundary ── */}
      <div
        className="no-print"
        style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}
      >
        <div style={{
          padding: "10px 16px", borderBottom: boundary ? "1px solid #e5e7eb" : undefined,
          display: "flex", alignItems: "center", gap: 10, background: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
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
              fields.applicantName || null,
              fields.landLocation || null,
            ].filter(Boolean).join("<br/>") || "New record"}
          />
        )}
      </div>

      {/* ── Document form ── */}
      <div
        id="form8-print-area"
        style={{
          background: "#f3f4f6",
          padding: "24px 0",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
          }}
        >
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
