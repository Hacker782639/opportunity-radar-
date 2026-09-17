import type { Job } from "../types";

const PROVIDER_TIMEOUT_MS = 8000;

export function isValidJob(job: Job): boolean {
  return (
    [job.id, job.title, job.company, job.url, job.source].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    ) && Array.isArray(job.skills)
  );
}

export function mapValidJobs<T>(
  items: T[],
  mapper: (item: T) => Job | null,
): Job[] {
  return items.flatMap((item) => {
    try {
      const job = mapper(item);

      return job && isValidJob(job) ? [job] : [];
    } catch {
      return [];
    }
  });
}

export function extractDeadline(text?: string): string | undefined {
  if (!text) return undefined;

  const plainText = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /application\s+deadline\s*[:\-]?\s*([A-Za-z]+\s+\d{1,2}\s+\d{4})/i,
    /applications?\s+close\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /applications?\s+(?:are\s+)?(?:accepted|open)\s+(?:until|through)\s+([A-Za-z]+\s+\d{1,2}\s+\d{4})/i,
    /application\s+closing\s+date\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
    /deadline\s*[:\-]?\s*(\d{4}-\d{1,2}-\d{1,2})/i,
    /deadline\s*[:\-]?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = plainText.match(pattern);

    if (!match?.[1]) continue;

    const cleaned = match[1].replace(
      /(\d{1,2})(st|nd|rd|th)\b/gi,
      "$1",
    );

    const timestamp = Date.parse(cleaned);

    if (Number.isNaN(timestamp)) continue;

    return new Date(timestamp).toISOString();
  }

  return undefined;
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
