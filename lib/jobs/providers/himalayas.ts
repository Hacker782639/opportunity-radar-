import type { Job } from "../types";
import { extractDeadline, fetchWithTimeout, mapValidJobs } from "./utils";

type HimalayasJob = {
  title?: string;
  excerpt?: string;
  companyName?: string;
  employmentType?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryPeriod?: string;
  currency?: string;
  seniority?: string[];
  locationRestrictions?: string[];
  categories?: string[];
  parentCategories?: string[];
  description?: string;
  pubDate?: number;
  applicationLink?: string;
  guid?: string;
};

type HimalayasResponse = {
  jobs?: HimalayasJob[];
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

export async function getHimalayasJobs(search = ""): Promise<Job[]> {
  const url = new URL("https://himalayas.app/jobs/api/search");

  url.searchParams.set("page", "1");
  url.searchParams.set("sort", "recent");

  if (search.trim()) {
    url.searchParams.set("q", search.trim());
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

  const data = (await response.json()) as HimalayasResponse;
  const query = search.trim().toLowerCase();

  return mapValidJobs(data.jobs ?? [], (job) => {
    if (!job.title || !job.applicationLink || !job.companyName) return null;

    let salary: string | undefined;

    if (job.minSalary || job.maxSalary) {
      const currency = job.currency || "USD";
      const period = job.salaryPeriod || "annual";

      if (job.minSalary && job.maxSalary) {
        salary = `${currency} ${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()} / ${period}`;
      } else if (job.minSalary) {
        salary = `${currency} ${job.minSalary.toLocaleString()}+ / ${period}`;
      } else if (job.maxSalary) {
        salary = `${currency} up to ${job.maxSalary.toLocaleString()} / ${period}`;
      }
    }

    const location =
      job.locationRestrictions && job.locationRestrictions.length > 0
        ? job.locationRestrictions.join(", ")
        : "Worldwide";

    const fullText = [
      job.title,
      job.companyName,
      job.excerpt,
      job.description,
      ...(job.categories ?? []),
      ...(job.parentCategories ?? []),
    ]
      .filter(Boolean)
      .join(" ");

    if (query) {
      const text = fullText.toLowerCase();

      if (!text.includes(query)) return null;
    }

    const publishedDate = job.pubDate
      ? new Date(job.pubDate * 1000)
      : undefined;

    return {
      id: `himalayas-${job.guid ?? job.applicationLink}`,
      title: job.title,
      company: job.companyName,
      category: job.categories?.[0] || job.parentCategories?.[0],
      location,
      remote: true,
      experience: job.seniority?.join(", ") || "Open",
      salary,
      url: job.applicationLink,
      source: "Himalayas",
      publishedAt:
        publishedDate && !Number.isNaN(publishedDate.getTime())
          ? publishedDate.toISOString()
          : undefined,
      deadline: extractDeadline(job.description || job.excerpt),
      skills: extractSkills(fullText),
      description: job.description || job.excerpt || undefined,
    };
  });
}
