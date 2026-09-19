import type { Job } from "../types";
import { getRemotiveJobs } from "../remotive";
import { getWeWorkRemotelyJobs } from "./weworkremotely";
import { getJobicyJobs } from "./jobicy";
import { getHimalayasJobs } from "./himalayas";
import { getRemoteLandersJobs } from "./remotelanders";
import { getMicro1JobDetails, getMicro1Jobs } from "./micro1";
import { getRemoteOkJobs } from "./remoteok";
import { isValidJob } from "./utils";

type ProviderResult = {
  source: string;
  jobs: Job[];
  ok: boolean;
};

type ProviderLoader = {
  prefix: string;
  source: string;
  load: (search?: string) => Promise<Job[]>;
  detail?: (job: Job) => Promise<Job | undefined>;
};

const JOB_INDEX_LIMIT = 2000;

const jobIndex = new Map<string, Job>();

/*
 * Micro1 is listed before Himalayas so its richer record (direct micro1
 * application URL plus full description) wins when the same real listing is
 * also aggregated by Himalayas.
 */
const providers: ProviderLoader[] = [
  { prefix: "remotive-", source: "Remotive", load: getRemotiveJobs },
  {
    prefix: "wwr-",
    source: "We Work Remotely",
    load: getWeWorkRemotelyJobs,
  },
  { prefix: "jobicy-", source: "Jobicy", load: getJobicyJobs },
  {
    prefix: "micro1-",
    source: "Micro1",
    load: getMicro1Jobs,
    detail: getMicro1JobDetails,
  },
  { prefix: "himalayas-", source: "Himalayas", load: getHimalayasJobs },
  {
    prefix: "remotelanders-",
    source: "Remote Landers",
    load: getRemoteLandersJobs,
  },
  { prefix: "remoteok-", source: "Remote OK", load: getRemoteOkJobs },
];

function rememberJobs(jobs: Job[]) {
  for (const job of jobs) {
    if (jobIndex.has(job.id)) {
      jobIndex.delete(job.id);
    }

    jobIndex.set(job.id, job);
  }

  while (jobIndex.size > JOB_INDEX_LIMIT) {
    const oldest = jobIndex.keys().next();

    if (oldest.done) break;

    jobIndex.delete(oldest.value);
  }
}

function getSearchableText(job: Job) {
  return [
    job.title,
    job.company,
    job.category,
    job.location,
    ...job.skills,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesSearch(job: Job, search: string) {
  const terms = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return true;

  const text = getSearchableText(job);

  return terms.every((term) => text.includes(term));
}

async function safeProvider(
  source: string,
  loader: () => Promise<Job[]>,
): Promise<ProviderResult> {
  try {
    const jobs = await loader();

    console.log(`[Opportunity Radar] ${source}: ${jobs.length} jobs`);

    return {
      source,
      jobs,
      ok: true,
    };
  } catch (error) {
    console.error(
      `[Opportunity Radar] ${source} failed:`,
      error,
    );

    return {
      source,
      jobs: [],
      ok: false,
    };
  }
}

function micro1Identity(job: Job) {
  return `${job.company}::${job.title}`
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * micro1 roles are also aggregated by Himalayas. When the dedicated Micro1
 * provider returned a listing, drop the Himalayas duplicate so the feed does
 * not show the same real opportunity twice. If Micro1 is unavailable, the
 * Himalayas copy is kept instead of losing the opportunity entirely.
 */
function dedupeMicro1Listings(results: ProviderResult[]): ProviderResult[] {
  const micro1 = results.find((result) => result.source === "Micro1");

  if (!micro1 || micro1.jobs.length === 0) return results;

  const identities = new Set(micro1.jobs.map(micro1Identity));

  return results.map((result) => {
    if (result.source === micro1.source) return result;

    return {
      ...result,
      jobs: result.jobs.filter(
        (job) => !identities.has(micro1Identity(job)),
      ),
    };
  });
}

function jobMatchKey(job: Job) {
  return `${job.company}::${job.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jobCompleteness(job: Job) {
  return (
    (job.description?.trim() ? 2 : 0) +
    (job.salary ? 1 : 0) +
    (job.deadline ? 1 : 0)
  );
}

function providerRank(job: Job) {
  const index = providers.findIndex(
    (provider) =>
      provider.source.trim().toLowerCase() === job.source.trim().toLowerCase(),
  );

  return index === -1 ? providers.length : index;
}

function mergeDuplicateJob(primary: Job, others: Job[]): Job {
  return others.reduce<Job>(
    (merged, other) => ({
      ...merged,
      salary: merged.salary ?? other.salary,
      deadline: merged.deadline ?? other.deadline,
      publishedAt: merged.publishedAt ?? other.publishedAt,
      category: merged.category ?? other.category,
    }),
    primary,
  );
}

/*
 * The same real opening is often syndicated to multiple boards. Collapse a
 * group only when every contributing board supplied exactly one record, so
 * distinct same-title postings from a single board are never merged. The most
 * complete record wins and missing salary/deadline/date fields are filled in
 * from the other boards.
 */
function dedupeCrossSourceJobs(jobs: Job[]): Job[] {
  const groups = new Map<string, Job[]>();

  for (const job of jobs) {
    const key = jobMatchKey(job);

    if (!key) continue;

    const group = groups.get(key);

    if (group) group.push(job);
    else groups.set(key, [job]);
  }

  const result: Job[] = [];
  const emitted = new Set<string>();

  for (const job of jobs) {
    const key = jobMatchKey(job);

    if (!key) {
      result.push(job);
      continue;
    }

    if (emitted.has(key)) continue;

    emitted.add(key);

    const group = groups.get(key) ?? [job];
    const sources = new Set(
      group.map((item) => item.source.trim().toLowerCase()),
    );

    if (sources.size === 1 || sources.size !== group.length) {
      result.push(...group);
      continue;
    }

    const ranked = [...group].sort(
      (a, b) =>
        jobCompleteness(b) - jobCompleteness(a) ||
        providerRank(a) - providerRank(b),
    );
    const [best, ...rest] = ranked;

    result.push(mergeDuplicateJob(best, rest));
  }

  return result;
}

export async function getAllJobs(search = "") {
  const results = await Promise.all(
    providers.map((provider) =>
      safeProvider(provider.source, () => provider.load(search)),
    ),
  );

  if (results.every((result) => !result.ok)) {
    throw new Error("All opportunity providers failed.");
  }

  const providerJobs = dedupeMicro1Listings(results).map((result) => ({
    ...result,
    jobs: result.jobs
      .filter(isValidJob)
      .filter((job) => matchesSearch(job, search)),
  }));

  const allJobs = providerJobs.flatMap((result) => result.jobs);

  const unique = new Map<string, Job>();

  for (const job of allJobs) {
    const key = `${job.source.trim().toLowerCase()}::${job.id}`;

    if (!unique.has(key)) {
      unique.set(key, job);
    }
  }

  const jobs = dedupeCrossSourceJobs(Array.from(unique.values()));

  rememberJobs(jobs);

  return {
    jobs,
    providers: providerJobs.map((result) => ({
      source: result.source,
      count: result.jobs.length,
      status: result.ok ? "ok" : "error",
    })),
  };
}

function findProvider(id: string) {
  return providers.find((provider) => id.startsWith(provider.prefix));
}

async function enrichJob(
  provider: ProviderLoader,
  job: Job,
): Promise<Job> {
  if (!provider.detail || job.description) return job;

  try {
    const detailed = await provider.detail(job);

    if (!detailed) return job;

    rememberJobs([detailed]);

    return detailed;
  } catch (error) {
    console.error(
      `[Opportunity Radar] detail lookup failed for ${job.id}:`,
      error,
    );

    return job;
  }
}

export type JobLookupResult =
  | { status: "found"; job: Job }
  | { status: "not-found" }
  | { status: "unavailable" };

export async function lookupJobById(id: string): Promise<JobLookupResult> {
  const normalizedId = id.trim();

  if (!normalizedId) return { status: "not-found" };

  const provider = findProvider(normalizedId);
  const indexed = jobIndex.get(normalizedId);

  /*
   * A job already returned by getAllJobs() stays reachable without asking the
   * external providers again. Some sources (micro1) only ship descriptions on
   * their per-job endpoint, so enrich those once and cache the result.
   */
  if (indexed) {
    const job = provider ? await enrichJob(provider, indexed) : indexed;

    return { status: "found", job };
  }

  if (provider) {
    try {
      const providerJobs = (await provider.load("")).filter(isValidJob);

      rememberJobs(providerJobs);

      const match = providerJobs.find((item) => item.id === normalizedId);

      if (!match) return { status: "not-found" };

      const job = await enrichJob(provider, match);

      return { status: "found", job };
    } catch (error) {
      console.error(
        `[Opportunity Radar] lookup failed for ${normalizedId}:`,
        error,
      );

      return { status: "unavailable" };
    }
  }

  try {
    const { jobs } = await getAllJobs();
    const match = jobs.find((job) => job.id === normalizedId);

    return match
      ? { status: "found", job: match }
      : { status: "not-found" };
  } catch (error) {
    console.error(
      `[Opportunity Radar] fallback lookup failed for ${normalizedId}:`,
      error,
    );

    return { status: "unavailable" };
  }
}

export async function getJobById(id: string): Promise<Job | undefined> {
  const result = await lookupJobById(id);

  return result.status === "found" ? result.job : undefined;
}
