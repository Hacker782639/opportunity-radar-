import type { Job } from "../types";

export async function getWellfoundJobs(
  search = "",
): Promise<Job[]> {
  /*
   * Wellfound does not currently provide a public anonymous jobs API
   * suitable for server-side aggregation. Keep the provider ready for
   * an approved integration rather than scraping behind the scenes.
   */
  if (!search.trim()) return [];

  return [];
}

export function getWellfoundSearchUrl(search = "") {
  const query = encodeURIComponent(search.trim());

  return query
    ? `https://wellfound.com/jobs?query=${query}`
    : "https://wellfound.com/jobs";
}
