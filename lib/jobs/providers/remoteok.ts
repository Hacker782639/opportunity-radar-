import Parser from "rss-parser";
import type { Job } from "../types";

const parser = new Parser();

export async function getRemoteOkJobs(search = ""): Promise<Job[]> {
  const response = await fetch("https://remoteok.com/remote-jobs.rss", {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Remote OK RSS returned ${response.status}`);
  }

  const xml = await response.text();
  const feed = await parser.parseString(xml);
  const query = search.trim().toLowerCase();

  return feed.items
    .filter((item) => {
      if (!query) return true;

      const text = [
        item.title,
        item.contentSnippet,
        item.content,
        item.categories?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    })
    .map((item, index) => {
      const rawTitle = item.title ?? "Remote opportunity";

      return {
        id: `remoteok-${item.guid ?? item.link ?? index}`,
        title: rawTitle,
        company: "Remote OK",
        location: "Worldwide",
        remote: true,
        experience: "Open",
        url: item.link ?? "https://remoteok.com/",
        source: "Remote OK",
        publishedAt: item.pubDate,
        skills: item.categories ?? [],
      };
    });
}
