import { useEffect, useRef } from "react";

interface Props {
  url: string;
  scale?: number;
}

export function PdfViewer({ url, scale = 1.4 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    let cancelled = false;

    (async () => {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url,
      ).href;

      const pdf = await getDocument(url).promise;
      if (cancelled) return;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (cancelled) return;

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = "100%";
        canvas.style.display = "block";
        if (pageNum < pdf.numPages) {
          canvas.style.borderBottom = "1px solid #e5e7eb";
          canvas.style.marginBottom = "0";
        }

        const ctx = canvas.getContext("2d")!;
        ctx.scale(dpr, dpr);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        if (!cancelled) container.appendChild(canvas);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, scale]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", background: "#fff" }}
    />
  );
}
