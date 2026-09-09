import type { Job } from "../types";

export async function getContraJobs(
  search = "",
): Promise<Job[]> {
  /*
   * Contra's public job pages are available to candidates, but there
   * is no public anonymous aggregation API we should pretend to have.
   */
  if (!search.trim()) return [];

  return [];
}

export function getContraSearchUrl(search = "") {
  const query = encodeURIComponent(search.trim());

  return query
    ? `https://contra.com/jobs?search=${query}`
    : "https://contra.com/jobs";
}
