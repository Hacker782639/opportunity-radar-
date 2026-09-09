import type { Job } from "../types";

export async function getArcJobs(search = ""): Promise<Job[]> {
  /*
   * Arc does not currently expose a public jobs API for anonymous
   * aggregation. We keep Arc as a first-class provider and use its
   * official job search as the application destination.
   *
   * Live Arc listings can be connected later through an approved feed/API.
   */
  if (!search.trim()) return [];

  return [];
}

export function getArcSearchUrl(search = "") {
  const query = encodeURIComponent(search.trim());

  return query
    ? `https://arc.dev/remote-jobs/${query}`
    : "https://arc.dev/remote-jobs";
}
