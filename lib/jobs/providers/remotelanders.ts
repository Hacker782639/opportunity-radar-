import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  mapValidJobs,
  slugifyIdPart,
} from "./utils";

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
  description?: string;
};

type RemoteLandersResponse = {
  total?: number;
  page?: number;
  limit?: number;
  count?: number;
  jobs?: RemoteLandersJob[];
};

const PAGE_SIZE = 100;
const PAGES = 5;

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

async function fetchRemoteLandersPage(
  page: number,
): Promise<RemoteLandersJob[]> {
  const url = new URL("https://remotelanders.com/api/jobs");

  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));

  const response = await fetchWithTimeout(url.toString(), {
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

  return data.jobs ?? [];
}

export async function getRemoteLandersJobs(
  search = "",
): Promise<Job[]> {
  const pageNumbers = Array.from(
    { length: PAGES },
    (_, index) => index + 1,
  );

  const pages = await Promise.all(
    pageNumbers.map(async (page) => {
      try {
        return await fetchRemoteLandersPage(page);
      } catch (error) {
        console.error(
          `[Opportunity Radar] Remote Landers page ${page} failed:`,
          error,
        );

        return [] as RemoteLandersJob[];
      }
    }),
  );

  if (pages.every((items) => items.length === 0)) {
    throw new Error("Remote Landers returned no jobs.");
  }

  const query = search.trim().toLowerCase();

  return mapValidJobs(pages.flat(), (job) => {
    const url = job.applyUrl || job.url;

    if (!job.title || !job.company || !url) return null;

    const fullText = [
      job.title,
      job.company,
      job.category,
      job.location,
      job.level,
      ...(job.subtags ?? []),
      job.description,
    ]
      .filter(Boolean)
      .join(" ");

    if (query) {
      const text = fullText.toLowerCase();

      if (!text.includes(query)) return null;
    }

    return {
      id: `remotelanders-${slugifyIdPart(job.slug ?? job.url ?? "")}`,
      title: job.title,
      company: job.company,
      category: job.category || job.type || undefined,
      location: job.location || "Worldwide",
      remote: true,
      experience: job.level || "Open",
      salary: job.salary || undefined,
      url,
      source: "Remote Landers",
      publishedAt: job.postedDate || undefined,
      deadline: extractDeadline(job.description),
      skills: extractSkills(fullText),
    };
  });
}
