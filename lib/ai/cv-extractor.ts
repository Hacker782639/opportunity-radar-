import mammoth from "mammoth";

const MAX_CV_BYTES = 10 * 1024 * 1024;
const MAX_CV_TEXT = 30000;

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfJsModulePromise: Promise<PdfJsModule> | null = null;

function loadPdfJs() {
  pdfJsModulePromise ??= import("pdfjs-dist/legacy/build/pdf.mjs");

  return pdfJsModulePromise;
}

type PdfTextItem = {
  str: string;
  hasEOL?: boolean;
};

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof item.str === "string"
  );
}

async function extractPdfText(buffer: Buffer) {
  const { getDocument } = await loadPdfJs();
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  try {
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      try {
        const content = await page.getTextContent();
        let pageText = "";

        for (const item of content.items) {
          if (!isPdfTextItem(item)) continue;

          pageText += item.str;

          if (item.hasEOL) {
            pageText += "\n";
          }
        }

        if (pageText.trim()) {
          pages.push(pageText);
        }
      } finally {
        page.cleanup();
      }
    }

    return pages.join("\n\n");
  } finally {
    await loadingTask.destroy();
  }
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
    text = await extractPdfText(buffer);
  } else if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error("Unsupported CV format");
  }

  const cleaned = text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    throw new Error(
      extension === "pdf"
        ? "No readable text was found in the CV. The PDF may be image-based or scanned."
        : "No readable text was found in the CV",
    );
  }

  return cleaned.slice(0, MAX_CV_TEXT);
}
