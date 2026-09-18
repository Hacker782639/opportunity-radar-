import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  formatSalaryRange,
  mapValidJobs,
  slugifyIdPart,
  toIsoDate,
  toStringArray,
  toTrimmedString,
} from "./utils";

type HimalayasResponse = {
  jobs?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
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

async function fetchHimalayasItems(query: string): Promise<unknown[]> {
  const url = new URL("https://himalayas.app/jobs/api/search");

  url.searchParams.set("page", "1");
  url.searchParams.set("sort", "recent");

  if (query) {
    url.searchParams.set("q", query);
  }

  const response = await fetchWithTimeout(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    throw new Error(`Himalayas returned ${response.status}`);
  }

  const text = await response.text();

  if (!text.trim()) {
    throw new Error("Himalayas returned an empty response");
  }

  let data: HimalayasResponse;

  try {
    data = JSON.parse(text) as HimalayasResponse;
  } catch {
    throw new Error("Himalayas returned an invalid response");
  }

  return Array.isArray(data.jobs) ? data.jobs : [];
}

function mapHimalayasJobs(items: unknown[], search: string): Job[] {
  const query = search.trim().toLowerCase();

  return mapValidJobs(items, (raw) => {
    const job = asRecord(raw);

    const title = toTrimmedString(job.title);
    const company = toTrimmedString(job.companyName);
    const applicationLink = toTrimmedString(job.applicationLink);
    const guid = toTrimmedString(job.guid);
    const listingUrl = applicationLink ?? guid;

    if (!title || !company || !listingUrl) return null;

    const categories = toStringArray(job.categories);
    const parentCategories = toStringArray(job.parentCategories);
    const seniority = toStringArray(job.seniority);
    const locationRestrictions = toStringArray(job.locationRestrictions);
    const employmentType = toTrimmedString(job.employmentType);
    const excerpt = toTrimmedString(job.excerpt);
    const description = toTrimmedString(job.description);
    const fullDescription = description ?? excerpt;

    const fullText = [
      title,
      company,
      excerpt,
      description,
      employmentType,
      ...categories,
      ...parentCategories,
      ...seniority,
      ...locationRestrictions,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ");

    if (query) {
      const text = fullText.toLowerCase();

      if (!text.includes(query)) return null;
    }

    const location =
      locationRestrictions.length > 0
        ? locationRestrictions.join(", ")
        : "Worldwide";
    const salary = formatSalaryRange(job.minSalary, job.maxSalary, {
      currency: toTrimmedString(job.currency) ?? "USD",
      period: toTrimmedString(job.salaryPeriod) ?? "annual",
    });
    const publishedAt = toIsoDate(job.pubDate);
    const deadline =
      toIsoDate(job.expiryDate) ?? extractDeadline(fullDescription);

    // The API exposes a stable guid (the canonical listing URL). Slugifying
    // it keeps the /opportunities/[id] route segment URL-safe and stable.
    const identity = guid ?? listingUrl;

    return {
      id: `himalayas-${slugifyIdPart(identity)}`,
      title,
      company,
      category: categories[0] ?? parentCategories[0] ?? employmentType,
      location,
      remote: true,
      experience: seniority.length > 0 ? seniority.join(", ") : "Open",
      salary,
      url: listingUrl,
      source: "Himalayas",
      publishedAt,
      deadline,
      skills: extractSkills(fullText),
      description: fullDescription,
    };
  });
}

export async function getHimalayasJobs(search = ""): Promise<Job[]> {
  const query = search.trim();

  try {
    return mapHimalayasJobs(await fetchHimalayasItems(query), search);
  } catch (error) {
    if (!query) throw error;

    // The search endpoint can be slow or return an empty body under load.
    // Fall back to the recent feed and filter it locally instead of dropping
    // the whole provider for this request.
    console.error(
      "[Opportunity Radar] Himalayas search failed; using recent feed:",
      error,
    );

    return mapHimalayasJobs(await fetchHimalayasItems(""), search);
  }
}
