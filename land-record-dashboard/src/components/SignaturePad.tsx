import { useRef, useEffect, useState } from "react";
import SigPadLib from "signature_pad";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

export function SignaturePad({
  value,
  onChange,
  width = 260,
  height = 78,
  readOnly = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SigPadLib | null>(null);

  /*
   * Always-current ref for onChange.
   * The endStroke listener is registered once at mount and captures
   * a stale closure if we use `onChange` directly — every new signature
   * field would overwrite earlier ones with stale `fields` state.
   * Updating this ref on every render fixes that without re-initialising
   * the canvas.
   */
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  /* Hide placeholder as soon as the pen touches the canvas */
  const [hasStarted, setHasStarted] = useState(!!value);

  /* Initialise signature_pad once */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.getContext("2d")!.scale(dpr, dpr);

    const pad = new SigPadLib(canvas, {
      penColor: "#000",
      minWidth: 0.8,
      maxWidth: 2.4,
      velocityFilterWeight: 0.7,
    });

    if (readOnly) {
      pad.off();
    } else {
      pad.addEventListener("beginStroke", () => {
        setHasStarted(true);
      });

      pad.addEventListener("endStroke", () => {
        onChangeRef.current(pad.toDataURL("image/png"));
      });
    }

    padRef.current = pad;

    if (value) {
      pad.fromDataURL(value, { width, height });
    }

    return () => pad.off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Sync external clear (value set to "") */
  useEffect(() => {
    const pad = padRef.current;
    if (!pad || value) return;
    pad.clear();
    setHasStarted(false);
  }, [value]);

  function handleClear() {
    padRef.current?.clear();
    setHasStarted(false);
    onChange("");
  }

  const showPlaceholder = !hasStarted && !readOnly;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          position: "relative",
          width,
          height,
          border: "1px solid #bbb",
          borderRadius: 3,
          background: "#fff",
          cursor: readOnly ? "default" : "crosshair",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            touchAction: "none",
          }}
        />

        {showPlaceholder && (
          <div
            data-html2canvas-ignore="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              userSelect: "none",
              gap: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c4c4c4"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span
              style={{
                fontSize: 10,
                color: "#c4c4c4",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              Sign here
            </span>
          </div>
        )}
      </div>

      {!readOnly && hasStarted && (
        <button
          type="button"
          data-html2canvas-ignore="true"
          onClick={handleClear}
          style={{
            alignSelf: "flex-start",
            fontSize: 10,
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "system-ui, sans-serif",
            textDecoration: "underline",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
