import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  mapValidJobs,
  slugifyIdPart,
} from "./utils";

type JobicyJob = {
  id?: number | string;
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  pubDate?: string;
  url?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  jobSlug?: string;
};

type JobicyResponse = {
  jobs?: JobicyJob[];
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

export async function getJobicyJobs(search = ""): Promise<Job[]> {
  const url = new URL("https://jobicy.com/api/v2/remote-jobs");

  url.searchParams.set("count", "100");

  if (search.trim()) {
    url.searchParams.set("tag", search.trim());
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
    throw new Error(`Jobicy returned ${response.status}`);
  }

  const data = (await response.json()) as JobicyResponse;
  const query = search.trim().toLowerCase();

  return mapValidJobs(data.jobs ?? [], (job) => {
    if (!job.jobTitle || !job.url || !job.companyName) return null;

    const industry = Array.isArray(job.jobIndustry)
      ? job.jobIndustry.filter(Boolean).join(", ")
      : undefined;
    const type = Array.isArray(job.jobType)
      ? job.jobType.filter(Boolean).join(", ")
      : undefined;

    const fullText = [
      job.jobTitle,
      job.companyName,
      job.jobDescription,
      industry,
      type,
      job.jobGeo,
    ]
      .filter(Boolean)
      .join(" ");

    if (query) {
      const text = fullText.toLowerCase();

      if (!text.includes(query)) return null;
    }

    let salary: string | undefined;

    if (job.salaryMin || job.salaryMax) {
      const currency = job.salaryCurrency || "USD";
      const period = job.salaryPeriod || "yearly";

      if (job.salaryMin && job.salaryMax) {
        salary = `${currency} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()} / ${period}`;
      } else if (job.salaryMin) {
        salary = `${currency} ${job.salaryMin.toLocaleString()}+ / ${period}`;
      } else if (job.salaryMax) {
        salary = `${currency} up to ${job.salaryMax.toLocaleString()} / ${period}`;
      }
    }

    return {
      id: `jobicy-${slugifyIdPart(
        String(job.id ?? job.jobSlug ?? job.url),
      )}`,
      title: job.jobTitle,
      company: job.companyName,
      category: industry || type || undefined,
      location: job.jobGeo || "Worldwide",
      remote: true,
      experience: job.jobLevel || "Open",
      salary,
      url: job.url,
      source: "Jobicy",
      publishedAt: job.pubDate,
      deadline: extractDeadline(job.jobDescription),
      skills: extractSkills(fullText),
      description: job.jobDescription || undefined,
    };
  });
}
