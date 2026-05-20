import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { runOcr } from "../services/ocrService";
import { extractCertificateFields } from "../services/extractCertificateFields";
import { addRecord } from "../services/recordStorage";
import { logAction } from "../services/auditLog";
import type { CertificateFields } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";
import { createRecordNumber } from "../utils/createRecordNumber";
import { Form8DocumentPane } from "../components/Form8DocumentPane";

interface Props { onSaved: () => void; }

const PANEL_HEADER: React.CSSProperties = {
  padding: "9px 12px", borderBottom: "1px solid #e5e7eb",
  fontSize: 12, fontWeight: 600, color: "#6b7280",
  letterSpacing: "0.05em", textTransform: "uppercase",
  background: "#fff", display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
};
const outlineBtn: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: "#374151", background: "#fff",
  border: "1px solid #d1d5db", borderRadius: 6, padding: "3px 10px", cursor: "pointer",
  fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap",
};
const solidBtn: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "#fff", background: "#000", border: "none",
  borderRadius: 6, padding: "3px 10px", cursor: "pointer",
  fontFamily: "system-ui, sans-serif", whiteSpace: "nowrap",
};

export function CameraCapturePage({ onSaved }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const [baseUrl,       setBaseUrl]       = useState<string | null>(null); // LAN base, no params
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [ocrProgress,   setOcrProgress]   = useState(0);
  const [fields,        setFields]        = useState<CertificateFields>(emptyCertificateFields);
  const [rawText,       setRawText]       = useState("");
  const [hasExtracted,  setHasExtracted]  = useState(false);

  // Derive both QR URLs from the single base
  const cameraUrl  = baseUrl ? `${baseUrl}?phone=camera`  : null;
  const galleryUrl = baseUrl ? `${baseUrl}?phone=gallery` : null;

  // ── Resolve LAN base URL once on mount ──────────────────────────────────────
  const resolveBase = useCallback(async () => {
    const { hostname, port, pathname } = window.location;
    let base = window.location.origin + pathname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const ip = await new Promise<string | null>((resolve) => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer().then((o) => pc.setLocalDescription(o));
        pc.onicecandidate = (e) => {
          if (!e.candidate) { resolve(null); return; }
          const m = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (m && !m[1].startsWith("127.")) { resolve(m[1]); pc.close(); }
        };
        setTimeout(() => resolve(null), 1500);
      });
      if (ip) base = `http://${ip}${port ? `:${port}` : ""}${pathname}`;
    }
    setBaseUrl(base.replace(/\/$/, ""));
  }, []);

  // ── Poll for photo on mount — runs the whole time the page is open ──────────
  useEffect(() => {
    resolveBase();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/photo/poll");
        const { photo } = await res.json();
        if (photo) {
          setCapturedImage(photo);
          setHasExtracted(false);
          setRawText("");
          setFields(emptyCertificateFields);
          logAction("document_uploaded", "pending", "phone_camera");
        }
      } catch { /* server not ready */ }
    }, 1200);
    return () => clearInterval(pollRef.current!);
  }, [resolveBase]);

  // ── File upload fallback ────────────────────────────────────────────────────
  function handleFileInput(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      setHasExtracted(false); setRawText(""); setFields(emptyCertificateFields);
      logAction("document_uploaded", "pending", file.name);
    };
    reader.readAsDataURL(file);
  }

  // ── OCR ─────────────────────────────────────────────────────────────────────
  async function handleRunOcr() {
    if (!capturedImage) return;
    setIsProcessing(true); setOcrProgress(0);
    logAction("ocr_started", "pending", "camera");
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const text = await runOcr(file, (p) => setOcrProgress(p));
      setRawText(text);
      setFields(extractCertificateFields(text));
      setHasExtracted(true);
      logAction("ocr_completed", "pending", `camera — ${text.length} chars`);
    } catch { alert("OCR failed. Try a clearer photo."); }
    finally { setIsProcessing(false); setOcrProgress(0); }
  }

  function save(status: "ocr_extracted_needs_review" | "confirmed") {
    const now = new Date().toISOString();
    const id  = crypto.randomUUID();
    const recordNumber = createRecordNumber();
    addRecord({ id, recordNumber, source: "ocr_upload", status, ocrStatus: "completed", fields, rawOcrText: rawText, uploadedFileName: "capture.jpg", uploadedFileType: "image/jpeg", createdAt: now, updatedAt: now });
    logAction(status === "confirmed" ? "record_confirmed" : "record_updated", id, recordNumber);
    onSaved();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: 12 }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => handleFileInput(e.target.files?.[0] ?? null)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>

        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={PANEL_HEADER}>
            <span style={{ marginRight: "auto" }}>Camera</span>
            {capturedImage && (
              <>
                <button onClick={() => setCapturedImage(null)} style={outlineBtn}>Retake</button>
                {!hasExtracted && (
                  <button onClick={handleRunOcr} disabled={isProcessing}
                    style={{ ...solidBtn, background: isProcessing ? "#9ca3af" : "#000", cursor: isProcessing ? "not-allowed" : "pointer" }}>
                    {isProcessing ? `${ocrProgress}%` : "Run OCR"}
                  </button>
                )}
              </>
            )}
            {!capturedImage && (
              <button onClick={() => fileInputRef.current?.click()} style={outlineBtn}>Upload File</button>
            )}
          </div>

          <div style={{ flex: 1, overflow: "auto", position: "relative", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* ── Idle: both QR codes side by side ── */}
            {!capturedImage && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 28, width: "100%" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
                  Scan with your phone · Same Wi-Fi
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", maxWidth: 380 }}>
                  {/* Phone Camera */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "14px 12px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
                    {cameraUrl ? (
                      <QRCodeSVG value={cameraUrl} size={148} />
                    ) : (
                      <div style={{ width: 148, height: 148, background: "#f3f4f6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>Detecting…</span>
                      </div>
                    )}
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>Phone Camera</span>
                    </div>
                  </div>

                  {/* Phone Photos */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "14px 12px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
                    {galleryUrl ? (
                      <QRCodeSVG value={galleryUrl} size={148} />
                    ) : (
                      <div style={{ width: 148, height: 148, background: "#f3f4f6", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>Detecting…</span>
                      </div>
                    )}
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>Phone Photos</span>
                    </div>
                  </div>
                </div>

                {/* Waiting indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Waiting for photo…</span>
                </div>
              </div>
            )}

            {/* Captured photo */}
            {capturedImage && (
              <img src={capturedImage} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            )}

            {/* OCR overlay */}
            {isProcessing && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", overflow: "hidden" }}>
                <div className="ocr-scan-line" />
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.82)", color: "#fff", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="ocr-pulse-dot" /><span>{ocrProgress}%</span><span>Reading…</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: OCR result ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={PANEL_HEADER}>
            <span style={{ marginRight: "auto" }}>Form 8 — OCR Filled</span>
            {hasExtracted && (
              <>
                <button onClick={() => save("ocr_extracted_needs_review")} style={outlineBtn}>Save for Review</button>
                <button onClick={() => save("confirmed")} style={solidBtn}>Confirm Record</button>
              </>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "#fafafa" }}>
            {hasExtracted ? (
              <Form8DocumentPane fields={fields} onChange={setFields} />
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", gap: 8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                <span style={{ fontSize: 13 }}>OCR results will appear here</span>
                <span style={{ fontSize: 11 }}>Scan a QR code → take photo → Run OCR</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
