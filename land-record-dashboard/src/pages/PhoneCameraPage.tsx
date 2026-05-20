import { useRef, useState } from "react";

const phoneParam = new URLSearchParams(window.location.search).get("phone");
const isGallery = phoneParam === "gallery";

export function PhoneCameraPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleCapture(file: File | null) {
    if (!file) return;
    setStatus("sending");

    // Downscale large photos before sending (keeps payload reasonable)
    const dataUrl = await resizeImage(file, 1920);
    setPreview(dataUrl);

    try {
      const res = await fetch("/api/photo/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: dataUrl }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif", gap: 24, padding: 32,
    }}>
      {/* Hidden file input — camera or gallery depending on mode */}
      {isGallery ? (
        <input ref={inputRef} type="file" accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleCapture(e.target.files?.[0] ?? null)} />
      ) : (
        <input ref={inputRef} type="file" accept="image/*"
          // @ts-expect-error – valid HTML attribute
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleCapture(e.target.files?.[0] ?? null)} />
      )}

      {status === "idle" && (
        <>
          <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", lineHeight: 1.6 }}>
            {isGallery
              ? "Choose a photo of the document from your gallery.\nIt will appear on the desktop automatically."
              : "Point your camera at the document and take a photo.\nIt will appear on the desktop automatically."}
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              background: "#fff", color: "#000", border: "none",
              borderRadius: 16, padding: "18px 40px",
              fontSize: 18, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {isGallery ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
            {isGallery ? "Choose Photo" : "Take Photo"}
          </button>
        </>
      )}

      {status === "sending" && (
        <>
          {preview && <img src={preview} alt="" style={{ maxWidth: "80vw", maxHeight: "50vh", borderRadius: 12, objectFit: "contain" }} />}
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Sending to desktop…</div>
        </>
      )}

      {status === "done" && (
        <>
          {preview && <img src={preview} alt="" style={{ maxWidth: "80vw", maxHeight: "50vh", borderRadius: 12, objectFit: "contain" }} />}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Photo sent to desktop!</span>
          </div>
          <button
            onClick={reset}
            style={{
              background: "transparent", color: "#9ca3af",
              border: "1px solid #374151", borderRadius: 10,
              padding: "10px 24px", fontSize: 14, cursor: "pointer",
            }}
          >
            Take Another
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ color: "#f87171", fontSize: 14, textAlign: "center" }}>
            Failed to send. Make sure both devices are on the same Wi-Fi.
          </div>
          <button onClick={reset} style={{ color: "#9ca3af", background: "transparent", border: "1px solid #374151", borderRadius: 10, padding: "10px 24px", fontSize: 14, cursor: "pointer" }}>
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

// Resize image to max width while preserving aspect ratio
function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.src = url;
  });
}
