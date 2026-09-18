import Parser from "rss-parser";
import type { Job } from "../types";
import {
  extractDeadline,
  fetchWithTimeout,
  mapValidJobs,
  slugifyIdPart,
} from "./utils";

const parser = new Parser();

export async function getWeWorkRemotelyJobs(
  search = "",
): Promise<Job[]> {
  const response = await fetchWithTimeout(
    "https://weworkremotely.com/remote-jobs.rss",
    {
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`WWR returned ${response.status}`);
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);
  const query = search.trim().toLowerCase();

  return mapValidJobs(feed.items, (item) => {
    if (!item.title || !item.link) return null;

    const parts = item.title.split(":");
    if (parts.length < 2) return null;

    const company = parts[0].trim();
    const title = parts.slice(1).join(":").trim();

    if (!company || !title) return null;

    const fullText = [
      title,
      company,
      item.contentSnippet,
      item.content,
      ...(item.categories ?? []),
    ]
      .filter(Boolean)
      .join(" ");

    if (query) {
      const text = fullText.toLowerCase();

      if (!text.includes(query)) return null;
    }

    return {
      id: `wwr-${slugifyIdPart(item.guid ?? item.link)}`,
      title,
      company,
      category: item.categories?.[0],
      location: "Remote",
      remote: true,
      experience: "Open",
      url: item.link,
      source: "We Work Remotely",
      publishedAt: item.pubDate,
      deadline: extractDeadline(item.contentSnippet || item.content),
      skills: item.categories ?? [],
      description: item.contentSnippet || item.content || undefined,
    };
  });
}
