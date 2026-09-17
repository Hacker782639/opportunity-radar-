import mammoth from "mammoth";

const MAX_CV_BYTES = 10 * 1024 * 1024;
const MAX_CV_TEXT = 30000;

type PdfParseModule = typeof import("pdf-parse");

let pdfParseModulePromise: Promise<PdfParseModule> | null = null;

async function loadPdfParse() {
  pdfParseModulePromise ??= import("pdf-parse");

  const pdfModule = await pdfParseModulePromise;

  if (typeof pdfModule.PDFParse !== "function") {
    throw new Error("PDF parser is unavailable");
  }

  return pdfModule.PDFParse;
}

export async function extractCvText(
  file: ArrayBuffer,
  fileName: string,
): Promise<string> {
  const buffer = Buffer.from(file);

  if (buffer.length === 0) {
    throw new Error("CV file is empty");
  }

  if (buffer.length > MAX_CV_BYTES) {
    throw new Error("CV file is too large");
  }

  const extension = fileName.toLowerCase().split(".").pop();

  let text = "";

  if (extension === "pdf") {
    const PDFParse = await loadPdfParse();
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported CV format");
  }

  const cleaned = text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    throw new Error("No readable text was found in the CV");
  }

  return cleaned.slice(0, MAX_CV_TEXT);
}
