import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  formatSalaryRange,
  mapValidJobs,
  toFiniteNumber,
  toIsoDate,
  toStringArray,
  toTrimmedString,
} from "./utils";

/*
 * micro1 does not expose a paid or key-authenticated public API that this
 * app should depend on. The public jobs portal at jobs.micro1.ai reads from
 * the credential-free portal endpoint below, so Opportunity Radar uses the
 * same source and degrades gracefully when it is unavailable.
 */
const PORTAL_URL = "https://prod-api.micro1.ai/api/v1/job/portal";
const PORTAL_JOB_BASE = "https://jobs.micro1.ai/post";
const SOURCE = "Micro1";
const PAGE_SIZE = 100;
const MAX_PAGES = 4;
const CACHE_TTL_MS = 5 * 60 * 1000;

const PORTAL_FILTERS = { type: ["EXPERT"] };

type Micro1PortalResponse = {
  status?: unknown;
  data?: unknown;
};

type CacheEntry = {
  jobs: Job[];
  expiresAt: number;
};

let listCache: CacheEntry | null = null;
let listRequest: Promise<Job[]> | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function formatLabel(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildApplyUrl(
  jobId: string,
  record: Record<string, unknown>,
): string {
  const applyUrl = toTrimmedString(record.apply_url);

  return applyUrl ?? `${PORTAL_JOB_BASE}/${encodeURIComponent(jobId)}`;
}

function extractSalary(record: Record<string, unknown>): string | undefined {
  const hourly = asRecord(record.ideal_hourly_rate);
  const hourlySalary = formatSalaryRange(hourly.min, hourly.max, {
    currency: "USD",
    period: "hour",
  });

  if (hourlySalary) return hourlySalary;

  const yearly = toFiniteNumber(record.ideal_yearly_compensation);

  if (yearly !== null) {
    return `USD ${yearly.toLocaleString()} / year`;
  }

  return formatSalaryRange(
    record.ideal_monthly_salary_min,
    record.ideal_monthly_salary_max,
    { currency: "USD", period: "month" },
  );
}

function extractSkills(
  record: Record<string, unknown>,
  fallback: string[],
): string[] {
  const skills = uniqueStrings([
    ...toStringArray(record.required_skills),
    ...toStringArray(record.skills),
    ...toStringArray(record.job_tags),
  ]);

  return skills.length > 0 ? skills : fallback;
}

function mapMicro1Job(record: Record<string, unknown>, base?: Job): Job | null {
  const baseId = base?.id.startsWith("micro1-")
    ? base.id.slice("micro1-".length)
    : undefined;
  const jobId = toTrimmedString(record.job_id) ?? baseId;

  if (!jobId) return null;

  const title = toTrimmedString(record.job_name) ?? base?.title;

  if (!title) return null;

  const company =
    toTrimmedString(record.company_name) ?? base?.company ?? "micro1";
  const url = buildApplyUrl(jobId, record);
  const locationType = toTrimmedString(record.location_type);
  const locationName = toTrimmedString(record.location_name);
  const domainSlug = toTrimmedString(record.domain_slug);
  const roleType = toTrimmedString(record.role_type);
  const description =
    toTrimmedString(record.job_description) ?? base?.description;
  const category =
    (domainSlug ? formatLabel(domainSlug) : undefined) ??
    toTrimmedString(record.job_type) ??
    base?.category;
  const location =
    locationName ??
    (locationType ? formatLabel(locationType) : undefined) ??
    base?.location ??
    "Remote";
  const publishedAt =
    toIsoDate(record.date_posted) ?? base?.publishedAt;

  return {
    id: `micro1-${jobId}`,
    title,
    company,
    category,
    location,
    remote: locationType
      ? locationType.toLowerCase() !== "onsite"
      : (base?.remote ?? true),
    experience: (roleType ? formatLabel(roleType) : undefined) ?? base?.experience ?? "Open",
    salary: extractSalary(record) ?? base?.salary,
    url,
    source: SOURCE,
    publishedAt,
    deadline: extractDeadline(description) ?? base?.deadline,
    skills: extractSkills(record, base?.skills ?? []),
    description,
  };
}

async function fetchMicro1Page(page: number): Promise<unknown[]> {
  const url = new URL(PORTAL_URL);

  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(PAGE_SIZE));

  const response = await fetchWithTimeout(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "get_all_jobs",
      filters: PORTAL_FILTERS,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`micro1 portal returned ${response.status}`);
  }

  const data = (await response.json()) as Micro1PortalResponse;

  if (data.status === false) {
    throw new Error("micro1 portal rejected the jobs request");
  }

  return Array.isArray(data.data) ? data.data : [];
}

async function loadMicro1Jobs(): Promise<Job[]> {
  const pageNumbers = Array.from(
    { length: MAX_PAGES },
    (_, index) => index + 1,
  );

  const pages = await Promise.all(
    pageNumbers.map(async (page) => {
      try {
        return await fetchMicro1Page(page);
      } catch (error) {
        console.error(
          `[Opportunity Radar] micro1 page ${page} failed:`,
          error,
        );

        return [] as unknown[];
      }
    }),
  );

  return mapValidJobs(pages.flat(), (item) =>
    mapMicro1Job(asRecord(item)),
  );
}

async function getMicro1JobIndex(): Promise<Job[]> {
  if (listCache && listCache.expiresAt > Date.now()) {
    return listCache.jobs;
  }

  if (listRequest) {
    return listRequest;
  }

  listRequest = loadMicro1Jobs()
    .then((jobs) => {
      // Never cache an empty result, so a transient outage can recover.
      if (jobs.length > 0) {
        listCache = { jobs, expiresAt: Date.now() + CACHE_TTL_MS };
      }

      return jobs;
    })
    .catch((error) => {
      console.error("[Opportunity Radar] micro1 jobs failed:", error);

      return [];
    })
    .finally(() => {
      listRequest = null;
    });

  return listRequest;
}

function matchesSearch(job: Job, search: string): boolean {
  const terms = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return true;

  const text = [
    job.title,
    job.company,
    job.category,
    job.location,
    ...job.skills,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return terms.every((term) => text.includes(term));
}

export async function getMicro1Jobs(search = ""): Promise<Job[]> {
  const jobs = await getMicro1JobIndex();

  if (!search.trim()) return jobs;

  return jobs.filter((job) => matchesSearch(job, search));
}

export async function getMicro1JobDetails(
  job: Job,
): Promise<Job | undefined> {
  const jobId = job.id.startsWith("micro1-")
    ? job.id.slice("micro1-".length)
    : undefined;

  if (!jobId) return undefined;

  try {
    const response = await fetchWithTimeout(PORTAL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "get_job_details",
        job_id: jobId,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`micro1 portal returned ${response.status}`);
    }

    const data = (await response.json()) as Micro1PortalResponse;
    const record = asRecord(data.data);

    if (data.status === false || Object.keys(record).length === 0) {
      return undefined;
    }

    return mapMicro1Job(record, job) ?? undefined;
  } catch (error) {
    console.error(
      `[Opportunity Radar] micro1 details failed for ${job.id}:`,
      error,
    );

    return undefined;
  }
}
