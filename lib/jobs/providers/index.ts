import type { Job } from "../types";
import { getRemotiveJobs } from "../remotive";
import { getWeWorkRemotelyJobs } from "./weworkremotely";
import { getJobicyJobs } from "./jobicy";
import { getHimalayasJobs } from "./himalayas";
import { getRemoteLandersJobs } from "./remotelanders";

type ProviderResult = {
  source: string;
  jobs: Job[];
};

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
    };
  } catch (error) {
    console.error(
      `[Opportunity Radar] ${source} failed:`,
      error,
    );

    return {
      source,
      jobs: [],
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

  const allJobs = results.flatMap((result) => result.jobs);

  const unique = new Map<string, Job>();

  for (const job of allJobs) {
    const key =
      `${job.title.trim().toLowerCase()}::` +
      `${job.company.trim().toLowerCase()}`;

    if (!unique.has(key)) {
      unique.set(key, job);
    }
  }

  return {
    jobs: Array.from(unique.values()),
    providers: results.map((result) => ({
      source: result.source,
      count: result.jobs.length,
    })),
  };
}
