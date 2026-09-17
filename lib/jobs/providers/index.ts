import type { Job } from "../types";
import { getRemotiveJobs } from "../remotive";
import { getWeWorkRemotelyJobs } from "./weworkremotely";
import { getJobicyJobs } from "./jobicy";
import { getHimalayasJobs } from "./himalayas";
import { getRemoteLandersJobs } from "./remotelanders";
import { isValidJob } from "./utils";

type ProviderResult = {
  source: string;
  jobs: Job[];
  ok: boolean;
};

const JOB_INDEX_LIMIT = 2000;

const jobIndex = new Map<string, Job>();

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

export async function getAllJobs(search = "") {
  const results = await Promise.all([
    safeProvider("Remotive", () => getRemotiveJobs(search)),
    safeProvider(
      "We Work Remotely",
      () => getWeWorkRemotelyJobs(search),
    ),
    safeProvider("Jobicy", () => getJobicyJobs(search)),
    safeProvider("Himalayas", () => getHimalayasJobs(search)),
    safeProvider(
      "Remote Landers",
      () => getRemoteLandersJobs(search),
    ),
  ]);

  if (results.every((result) => !result.ok)) {
    throw new Error("All opportunity providers failed.");
  }

  const providerJobs = results.map((result) => ({
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

  const jobs = Array.from(unique.values());

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

const providerLoaders = [
  { prefix: "remotive-", load: getRemotiveJobs },
  { prefix: "wwr-", load: getWeWorkRemotelyJobs },
  { prefix: "jobicy-", load: getJobicyJobs },
  { prefix: "himalayas-", load: getHimalayasJobs },
  { prefix: "remotelanders-", load: getRemoteLandersJobs },
];

export async function getJobById(id: string): Promise<Job | undefined> {
  const indexed = jobIndex.get(id);

  if (indexed) {
    return indexed;
  }

  const provider = providerLoaders.find((item) =>
    id.startsWith(item.prefix),
  );

  if (provider) {
    try {
      const providerJobs = (await provider.load("")).filter(isValidJob);
      const job = providerJobs.find((item) => item.id === id);

      rememberJobs(providerJobs);

      return job;
    } catch (error) {
      console.error(
        `[Opportunity Radar] lookup failed for ${id}:`,
        error,
      );
    }
  }

  const { jobs } = await getAllJobs();

  return jobs.find((job) => job.id === id);
}
