import type { Job } from "../types";

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

  const response = await fetch(url.toString(), {
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

  return (data.jobs ?? [])
    .filter((job) => job.title && job.applicationLink)
    .filter((job) => {
      if (!query) return true;

      const text = [
        job.title,
        job.companyName,
        job.excerpt,
        job.description,
        ...(job.categories ?? []),
        ...(job.parentCategories ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    })
    .map((job) => {
      let salary: string | undefined;

      if (job.minSalary || job.maxSalary) {
        const currency = job.currency || "USD";
        const period = job.salaryPeriod || "annual";

        if (job.minSalary && job.maxSalary) {
          salary = `${currency} ${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()} / ${period}`;
        } else if (job.minSalary) {
          salary = `${currency} ${job.minSalary.toLocaleString()}+ / ${period}`;
        }
      }

      const location =
        job.locationRestrictions && job.locationRestrictions.length > 0
          ? job.locationRestrictions.join(", ")
          : "Worldwide";

      const fullText = [
        job.title,
        job.excerpt,
        job.description,
        ...(job.categories ?? []),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: `himalayas-${job.guid ?? job.applicationLink}`,
        title: job.title!,
        company: job.companyName || "Himalayas",
        location,
        remote: true,
        experience: job.seniority?.join(", ") || "Open",
        salary,
        url: job.applicationLink!,
        source: "Himalayas",
        publishedAt: job.pubDate
          ? new Date(job.pubDate).toISOString()
          : undefined,
        skills: extractSkills(fullText),
      };
    });
}
