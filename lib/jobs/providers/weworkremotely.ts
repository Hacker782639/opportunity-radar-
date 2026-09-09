import Parser from "rss-parser";
import type { Job } from "../types";

const parser = new Parser();

export async function getWeWorkRemotelyJobs(
  search = "",
): Promise<Job[]> {
  const response = await fetch(
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
      const title = item.title ?? "Remote opportunity";
      const parts = title.split(":");
      const company =
        parts.length > 1 ? parts[0].trim() : "We Work Remotely";

      return {
        id: `wwr-${item.guid ?? item.link ?? index}`,
        title:
          parts.length > 1
            ? parts.slice(1).join(":").trim()
            : title,
        company,
        location: "Remote",
        remote: true,
        experience: "Open",
        url: item.link ?? "https://weworkremotely.com/",
        source: "We Work Remotely",
        publishedAt: item.pubDate,
        skills: item.categories ?? [],
      };
    });
}
