import type { Job } from "../types";

type RemoteLandersJob = {
  slug?: string;
  title?: string;
  company?: string;
  category?: string;
  subtags?: string[];
  location?: string;
  type?: string;
  level?: string;
  salary?: string | null;
  postedDate?: string | null;
  url?: string;
  applyUrl?: string;
};

type RemoteLandersResponse = {
  total?: number;
  page?: number;
  limit?: number;
  count?: number;
  jobs?: RemoteLandersJob[];
};

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

export async function getRemoteLandersJobs(
  search = "",
): Promise<Job[]> {
  const url = new URL("https://remotelanders.com/api/jobs");

  url.searchParams.set("limit", "100");

  if (search.trim()) {
    url.searchParams.set("category", "Engineering");
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 600,
    },
  });

  if (!response.ok) {
    throw new Error(`Remote Landers returned ${response.status}`);
  }

  const data = (await response.json()) as RemoteLandersResponse;
  const query = search.trim().toLowerCase();

  return (data.jobs ?? [])
    .filter((job) => job.title && (job.applyUrl || job.url))
    .filter((job) => {
      if (!query) return true;

      const text = [
        job.title,
        job.company,
        job.category,
        job.location,
        job.level,
        ...(job.subtags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    })
    .map((job) => {
      const fullText = [
        job.title,
        job.category,
        ...(job.subtags ?? []),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `remotelanders-${job.slug ?? job.title}`,
        title: job.title!,
        company: job.company || "Remote Landers",
        location: job.location || "Worldwide",
        remote: true,
        experience: job.level || "Open",
        salary: job.salary || undefined,
        url: job.applyUrl || job.url!,
        source: "Remote Landers",
        publishedAt: job.postedDate || undefined,
        skills: extractSkills(fullText),
      };
    });
}
