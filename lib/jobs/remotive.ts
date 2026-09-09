import type { Job } from "./types";

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

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Jobs provider returned ${response.status}`);
  }

  const data = (await response.json()) as RemotiveResponse;

  return (data.jobs ?? []).map((job) => ({
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    remote: true,
    experience: "Open",
    salary: job.salary || undefined,
    url: job.url,
    source: "Remotive",
    publishedAt: job.publication_date,
    skills: job.tags ?? [],
  }));
}
