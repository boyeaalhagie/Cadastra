import { useState, useRef, useEffect } from "react";
import { runOcr } from "../services/ocrService";
import { extractCertificateFields } from "../services/extractCertificateFields";
import { addRecord } from "../services/recordStorage";
import { logAction } from "../services/auditLog";
import type { CertificateFields } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";
import { createRecordNumber } from "../utils/createRecordNumber";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import { Form8DocumentPane } from "../components/Form8DocumentPane";
import { PdfViewer } from "../components/PdfViewer";

interface UploadOcrPageProps {
  onSaved: () => void;
}

const PANEL_HEADER: React.CSSProperties = {
  padding: "9px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};

export function UploadOcrPage({ onSaved }: UploadOcrPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [fields, setFields] = useState<CertificateFields>(emptyCertificateFields);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusLabel, setOcrStatusLabel] = useState("");
  const [activeTab, setActiveTab] = useState<"document" | "image">("document");
  const prevBlobUrl = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current); };
  }, []);

  async function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;
    if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    const url = URL.createObjectURL(selectedFile);
    prevBlobUrl.current = url;
    setBlobUrl(url);
    setFile(selectedFile);
    setHasExtracted(false);
    setRawText("");
    setFields(emptyCertificateFields);
    setOcrProgress(0);
    setActiveTab("document");
    const dataUrl = await fileToDataUrl(selectedFile);
    setFileDataUrl(dataUrl);
    logAction("document_uploaded", "pending", selectedFile.name);
  }

  async function handleRunOcr() {
    if (!file) return;
    setIsProcessing(true);
    setOcrProgress(0);
    setOcrStatusLabel("Starting…");
    logAction("ocr_started", "pending", file.name);

    try {
      let text = "";
      if (file.type === "application/pdf") {
        const { runOcrOnPdf } = await import("../services/pdfOcrService");
        text = await runOcrOnPdf(file, (page, total, pageProgress) => {
          const overall = ((page - 1) + pageProgress) / total;
          setOcrProgress(Math.round(overall * 100));
          setOcrStatusLabel(total > 1 ? `Page ${page} of ${total}` : "Reading…");
        });
      } else {
        text = await runOcr(file, (p) => {
          setOcrProgress(p);
          setOcrStatusLabel("Reading…");
        });
      }

      const extracted = extractCertificateFields(text);
      setRawText(text);
      setFields(extracted);
      setHasExtracted(true);
      logAction("ocr_completed", "pending", `${file.name} — ${text.length} chars`);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Please try a clearer image or document.");
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
      setOcrStatusLabel("");
    }
  }

  function save(status: "ocr_extracted_needs_review" | "confirmed") {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const recordNumber = createRecordNumber();
    addRecord({
      id, recordNumber,
      source: "ocr_upload", status, ocrStatus: "completed",
      fields, rawOcrText: rawText,
      uploadedFileName: file?.name,
      uploadedFileType: file?.type,
      createdAt: now, updatedAt: now,
    });
    logAction(status === "confirmed" ? "record_confirmed" : "record_updated", id, recordNumber);
    onSaved();
  }

  const isPdf = file?.type === "application/pdf";

  function Tab({ id, label }: { id: "document" | "image"; label: string }) {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          fontSize: 11,
          fontWeight: active ? 600 : 400,
          color: active ? "#000" : "#9ca3af",
          background: active ? "#f3f4f6" : "transparent",
          border: "1px solid",
          borderColor: active ? "#e5e7eb" : "transparent",
          borderRadius: 6,
          padding: "2px 8px",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: 0,
          textTransform: "none",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: 12 }}>
      {/* <h2 className="text-2xl font-semibold tracking-tight shrink-0">Upload + OCR</h2> */}

      {/* ── Two-column layout (always shown) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>

        {/* ── Left: Original Document ── */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

          {/* Header */}
          <div style={PANEL_HEADER}>
            <span style={{ marginRight: "auto" }}>Original Document</span>

            {/* Tab — only when file loaded */}
            {file && <Tab id="document" label="Document" />}

            {/* File picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#374151",
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: 0,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {file ? "Change" : "Upload"}
            </button>

            {/* Run OCR */}
            {file && (
              <button
                onClick={handleRunOcr}
                disabled={isProcessing}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  background: isProcessing ? "#9ca3af" : "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  fontFamily: "system-ui, sans-serif",
                  letterSpacing: 0,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Run OCR
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: "auto", position: "relative", background: "#fafafa" }}>
            {!file ? (
              /* Upload placeholder */
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: 10,
                  color: "#9ca3af",
                  fontFamily: "system-ui, sans-serif",
                  userSelect: "none",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span style={{ fontSize: 13 }}>Click to upload a PDF or image</span>
                <span style={{ fontSize: 11 }}>PNG, JPG, PDF supported</span>
              </div>
            ) : activeTab === "document" ? (
              isPdf ? <PdfViewer url={blobUrl} /> : (
                <img src={fileDataUrl} alt="Document" style={{ width: "100%", display: "block" }} />
              )
            ) : (
              /* Image tab */
              <img src={fileDataUrl} alt="Uploaded file" style={{ width: "100%", display: "block" }} />
            )}

            {/* Scan overlay */}
            {isProcessing && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", overflow: "hidden" }}>
                <div className="ocr-scan-line" />
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "rgba(0,0,0,0.82)", color: "#fff",
                  padding: "6px 14px", borderRadius: 999,
                  fontSize: 12, fontWeight: 600,
                  fontFamily: "system-ui, sans-serif",
                  display: "flex", alignItems: "center", gap: 8,
                  backdropFilter: "blur(6px)",
                }}>
                  <span className="ocr-pulse-dot" />
                  {ocrProgress > 0 && <span>{ocrProgress}%</span>}
                  <span>{ocrStatusLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Form 8 OCR Filled ── */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>

          {/* Header */}
          <div style={PANEL_HEADER}>
            <span style={{ marginRight: "auto" }}>Form 8 — OCR Filled</span>
            {hasExtracted && (
              <>
                <button
                  onClick={() => save("ocr_extracted_needs_review")}
                  style={{
                    fontSize: 11, fontWeight: 500, color: "#374151",
                    background: "#fff", border: "1px solid #d1d5db",
                    borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                    fontFamily: "system-ui, sans-serif", letterSpacing: 0, textTransform: "none",
                  }}
                >
                  Save for Review
                </button>
                <button
                  onClick={() => save("confirmed")}
                  style={{
                    fontSize: 11, fontWeight: 600, color: "#fff",
                    background: "#000", border: "none",
                    borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                    fontFamily: "system-ui, sans-serif", letterSpacing: 0, textTransform: "none",
                  }}
                >
                  Confirm Record
                </button>
              </>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "#fafafa" }}>
            {hasExtracted ? (
              <Form8DocumentPane fields={fields} onChange={setFields} />
            ) : (
              <div style={{
                height: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: "#9ca3af", fontFamily: "system-ui, sans-serif", gap: 8,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <span style={{ fontSize: 13 }}>OCR results will appear here</span>
                <span style={{ fontSize: 11 }}>Upload a document and click Run OCR</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
