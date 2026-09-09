import type { Job } from "../types";

type Micro1Job = {
  job_id?: string;
  job_title?: string;
  job_description?: string;
  job_apply_url?: string;
  job_status?: string;
  date_created?: string;
  date_modified?: string;
};

type Micro1Response = {
  status?: boolean;
  data?: Micro1Job[];
};

export async function getMicro1Jobs(search = ""): Promise<Job[]> {
  const apiKey = process.env.MICRO1_API_KEY;

  if (!apiKey) {
    return [];
  }

  const url = new URL("https://public.api.micro1.ai/jobs");

  url.searchParams.set("limit", "100");

  if (search.trim()) {
    url.searchParams.set("keyword", search.trim());
  }

  const response = await fetch(url.toString(), {
    headers: {
      "x-api-key": apiKey,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`micro1 returned ${response.status}`);
  }

  const data = (await response.json()) as Micro1Response;

  return (data.data ?? [])
    .filter((job) => job.job_status !== "closed")
    .map((job) => ({
      id: `micro1-${job.job_id}`,
      title: job.job_title ?? "Remote role",
      company: "micro1",
      location: "Remote",
      remote: true,
      experience: "Open",
      url:
        job.job_apply_url ??
        `https://microonejobs.com/jobs`,
      source: "micro1",
      publishedAt: job.date_modified ?? job.date_created,
      skills: extractSkills(job.job_description ?? ""),
    }));
}

function extractSkills(text: string) {
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
    "product design",
    "machine learning",
    "ai",
  ];

  const lower = text.toLowerCase();

  return known.filter((skill) => lower.includes(skill));
}
