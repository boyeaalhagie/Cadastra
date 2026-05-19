import Tesseract from "tesseract.js";

export async function runOcr(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const result = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round((m.progress as number) * 100));
      }
    },
  });
  return result.data.text;
}
