import type { Job } from "../types";

const PROVIDER_TIMEOUT_MS = 8000;

const ISO_LIKE_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

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

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function toIsoDate(value: unknown): string | undefined {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return undefined;

    // Provider feeds use both seconds and milliseconds since the epoch.
    const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
    const date = new Date(milliseconds);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();
    const normalized = ISO_LIKE_DATE_TIME.test(raw)
      ? `${raw.replace(" ", "T")}Z`
      : raw;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  return undefined;
}

export function slugifyIdPart(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

  return slug || "listing";
}

export function formatSalaryRange(
  minValue: unknown,
  maxValue: unknown,
  options: { currency?: string; period?: string } = {},
): string | undefined {
  const min = toFiniteNumber(minValue);
  const max = toFiniteNumber(maxValue);

  if (min === null && max === null) return undefined;

  const currency = options.currency?.trim();
  const period = options.period?.trim();
  const prefix = currency ? `${currency} ` : "";
  const suffix = period ? ` / ${period}` : "";

  if (min !== null && max !== null) {
    return `${prefix}${min.toLocaleString()}–${max.toLocaleString()}${suffix}`;
  }

  if (min !== null) {
    return `${prefix}${min.toLocaleString()}+${suffix}`;
  }

  return `${prefix}up to ${max?.toLocaleString() ?? ""}${suffix}`;
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
