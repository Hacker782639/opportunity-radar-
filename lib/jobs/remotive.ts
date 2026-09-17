import type { Job } from "./types";
import { extractDeadline, fetchWithTimeout, mapValidJobs } from "./providers/utils";

type RemotiveJob = {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  job_type: string;
  salary: string;
  url: string;
  publication_date: string;
  tags: string[];
  description?: string;
};

type RemotiveResponse = {
  jobs?: RemotiveJob[];
};

export async function getRemotiveJobs(search = ""): Promise<Job[]> {
  const query = search.trim();

  const url = new URL("https://remotive.com/api/remote-jobs");

  if (query) {
    url.searchParams.set("search", query);
  }

  const response = await fetchWithTimeout(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Remotive returned ${response.status}`);
  }

  const data = (await response.json()) as RemotiveResponse;

  return mapValidJobs(data.jobs ?? [], (job) => {
    if (!job.id || !job.title || !job.company_name || !job.url) return null;

    return {
      id: `remotive-${job.id}`,
      title: job.title,
      company: job.company_name,
      category: job.job_type || undefined,
      location: job.candidate_required_location || "Remote",
      remote: true,
      experience: "Open",
      salary: job.salary || undefined,
      url: job.url,
      source: "Remotive",
      publishedAt: job.publication_date,
      deadline: extractDeadline(job.description),
      skills: job.tags ?? [],
      description: job.description || undefined,
    };
  });
}
