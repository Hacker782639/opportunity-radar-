import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  formatSalaryRange,
  mapValidJobs,
  slugifyIdPart,
  toFiniteNumber,
  toIsoDate,
  toStringArray,
  toTrimmedString,
} from "./utils";

const REMOTE_OK_API = "https://remoteok.com/api";

type RemoteOkRecord = Record<string, unknown>;

function asRecord(value: unknown): RemoteOkRecord {
  return value && typeof value === "object"
    ? (value as RemoteOkRecord)
    : {};
}

/*
 * Remote OK ships descriptions as HTML. Normalize them to plain text so the
 * opportunity detail page renders them like every other provider.
 */
function toPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSkills(text: string): string[] {
  const known = [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "python",
    "java",
    "go",
    "rust",
    "sql",
    "postgresql",
    "aws",
    "docker",
    "kubernetes",
    "figma",
    "html",
    "css",
    "php",
    "ruby",
    "swift",
    "flutter",
    "vue",
    "angular",
    "ai",
    "machine learning",
  ];

  const lower = text.toLowerCase();

  return known.filter((skill) => lower.includes(skill));
}

export async function getRemoteOkJobs(search = ""): Promise<Job[]> {
  const response = await fetchWithTimeout(REMOTE_OK_API, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    },
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    throw new Error(`Remote OK returned ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error("Remote OK returned an unexpected response");
  }

  const query = search.trim().toLowerCase();

  return mapValidJobs(payload.map(asRecord), (job) => {
    const title = toTrimmedString(job.position);
    const company = toTrimmedString(job.company);
    const url = toTrimmedString(job.url) ?? toTrimmedString(job.apply_url);
    const rawDescription = toTrimmedString(job.description);
    const description = rawDescription
      ? toPlainText(rawDescription)
      : undefined;
    const tags = toStringArray(job.tags);
    const location = toTrimmedString(job.location);

    if (!title || !company || !url) return null;

    const identity =
      toTrimmedString(job.id) ?? toTrimmedString(job.slug) ?? url;

    const fullText = [title, company, location, ...tags, description]
      .filter((value): value is string => Boolean(value))
      .join(" ");

    if (query && !fullText.toLowerCase().includes(query)) return null;

    const salaryMin = toFiniteNumber(job.salary_min);
    const salaryMax = toFiniteNumber(job.salary_max);
    const salary = formatSalaryRange(
      salaryMin && salaryMin > 0 ? salaryMin : undefined,
      salaryMax && salaryMax > 0 ? salaryMax : undefined,
      { currency: "USD", period: "annual" },
    );

    const knownSkills = extractSkills(fullText);

    return {
      id: `remoteok-${slugifyIdPart(identity)}`,
      title,
      company,
      category: tags[0],
      location: location || "Worldwide",
      remote: true,
      experience: "Open",
      salary,
      url,
      source: "Remote OK",
      publishedAt: toIsoDate(job.date ?? job.epoch),
      deadline: extractDeadline(description),
      skills: knownSkills.length > 0 ? knownSkills : tags,
      description,
    };
  });
}
