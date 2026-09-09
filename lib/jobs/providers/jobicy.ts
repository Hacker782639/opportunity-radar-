import type { Job } from "../types";

type JobicyJob = {
  id?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  jobIndustry?: string;
  jobType?: string;
  jobGeo?: string;
  jobLevel?: string;
  pubDate?: string;
  url?: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
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

  url.searchParams.set("count", "200");

  if (search.trim()) {
    url.searchParams.set("tag", search.trim());
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
    throw new Error(`Jobicy returned ${response.status}`);
  }

  const data = (await response.json()) as JobicyResponse;

  const query = search.trim().toLowerCase();

  return (data.jobs ?? [])
    .filter((job) => job.jobTitle && job.url)
    .filter((job) => {
      if (!query) return true;

      const text = [
        job.jobTitle,
        job.companyName,
        job.jobDescription,
        job.jobIndustry,
        job.jobLevel,
        job.jobGeo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    })
    .map((job) => {
      const fullText = [
        job.jobTitle,
        job.jobDescription,
        job.jobIndustry,
      ]
        .filter(Boolean)
        .join(" ");

      let salary: string | undefined;

      if (job.annualSalaryMin || job.annualSalaryMax) {
        const currency = job.salaryCurrency || "USD";

        if (job.annualSalaryMin && job.annualSalaryMax) {
          salary = `${currency} ${job.annualSalaryMin.toLocaleString()}–${job.annualSalaryMax.toLocaleString()}`;
        } else if (job.annualSalaryMin) {
          salary = `${currency} ${job.annualSalaryMin.toLocaleString()}+`;
        }
      }

      return {
        id: `jobicy-${job.id ?? job.jobSlug ?? job.jobTitle}`,
        title: job.jobTitle!,
        company: job.companyName || "Jobicy",
        location: job.jobGeo || "Worldwide",
        remote: true,
        experience: job.jobLevel || "Open",
        salary,
        url: job.url!,
        source: "Jobicy",
        publishedAt: job.pubDate,
        skills: extractSkills(fullText),
      };
    });
}
