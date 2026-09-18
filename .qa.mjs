const BASE = process.env.QA_BASE || "http://localhost:3120";

const fail = [];
const note = [];
function check(cond, msg) {
  if (cond) console.log("PASS:", msg);
  else { console.log("FAIL:", msg); fail.push(msg); }
}

async function getJobs(search = "") {
  const res = await fetch(`${BASE}/api/jobs?search=${encodeURIComponent(search)}`);
  const body = await res.json();
  return { status: res.status, body };
}

const ID_RE = /^[a-z0-9-]+$/;
const REQUIRED = ["id", "title", "company", "url", "source"];

const { status, body } = await getJobs("");
check(status === 200 && body.success === true, `GET /api/jobs returns 200 success (got ${status})`);
check(Array.isArray(body.jobs) && body.jobs.length > 0, `feed has jobs (${body.jobs?.length})`);
check(Array.isArray(body.providers), "feed exposes provider statuses");

for (const p of body.providers ?? []) {
  check(p.status === "ok", `provider ${p.source} ok (count=${p.count}, status=${p.status})`);
}

const jobs = body.jobs ?? [];
const badIds = jobs.filter((j) => !ID_RE.test(j.id));
check(badIds.length === 0, `all ids URL-safe (${badIds.length} bad; e.g. ${badIds[0]?.id})`);

const missing = jobs.filter((j) => REQUIRED.some((k) => typeof j[k] !== "string" || !j[k].trim()) || !Array.isArray(j.skills));
check(missing.length === 0, `all jobs have required fields + skills array (${missing.length} bad)`);

const badUrls = jobs.filter((j) => { try { const u = new URL(j.url); return !["http:", "https:"].includes(u.protocol); } catch { return true; } });
check(badUrls.length === 0, `all urls absolute http(s) (${badUrls.length} bad; e.g. ${badUrls[0]?.url})`);

const badDates = jobs.filter((j) => j.publishedAt && Number.isNaN(Date.parse(j.publishedAt)));
check(badDates.length === 0, `all publishedAt parseable (${badDates.length} bad)`);

const idDupes = new Map();
for (const j of jobs) idDupes.set(j.id, (idDupes.get(j.id) ?? 0) + 1);
const dupeIds = [...idDupes].filter(([, n]) => n > 1);
check(dupeIds.length === 0, `no duplicate ids in feed (${dupeIds.length} dupes)`);

const key = (j) => `${j.company.toLowerCase()}::${j.title.toLowerCase()}`;
const cross = new Map();
for (const j of jobs) {
  const k = key(j);
  if (!cross.has(k)) cross.set(k, []);
  cross.get(k).push(j.source);
}
const crossDupes = [...cross].filter(([, sources]) => new Set(sources).size > 1);
note.push(`cross-source company+title duplicates: ${crossDupes.length}`);
for (const [k, s] of crossDupes.slice(0, 10)) console.log("   cross-dupe:", k, "=>", s.join(","));

// description coverage
const bySource = {};
for (const j of jobs) {
  bySource[j.source] ??= { total: 0, withDesc: 0, withSalary: 0, withDeadline: 0 };
  bySource[j.source].total++;
  if (j.description && j.description.trim().length > 40) bySource[j.source].withDesc++;
  if (j.salary) bySource[j.source].withSalary++;
  if (j.deadline) bySource[j.source].withDeadline++;
}
console.log("description coverage:", JSON.stringify(bySource, null, 2));

// stability across two consecutive fetches
const second = (await getJobs("")).body.jobs ?? [];
const firstIds = new Set(jobs.map((j) => j.id));
const secondIds = new Set(second.map((j) => j.id));
const missingIds = [...firstIds].filter((id) => !secondIds.has(id));
check(missingIds.length === 0, `ids stable across fetches (${missingIds.length} missing on second fetch)`);

// search
function matchesTerms(job, term) {
  const text = [job.title, job.company, job.category, job.location, ...job.skills].filter(Boolean).join(" ").toLowerCase();
  return term.toLowerCase().split(/\s+/).filter(Boolean).every((t) => text.includes(t));
}
for (const term of ["react", "designer", "stripe", "python", "no-such-role-xyzzy"]) {
  const r = await getJobs(term);
  check(r.status === 200 && r.body.success === true, `search "${term}" returns 200`);
  const bad = (r.body.jobs ?? []).filter((j) => !matchesTerms(j, term));
  const errProviders = (r.body.providers ?? []).filter((p) => p.status !== "ok").map((p) => p.source);
  check(bad.length === 0, `search "${term}" results all match (${bad.length} mismatches)`);
  console.log(`   search "${term}": ${r.body.jobs?.length} results; providers errors: ${errProviders.length ? errProviders.join(",") : "none"}`);
}

// detail lookups per source
const perSource = {};
for (const j of jobs) { if (!perSource[j.source]) perSource[j.source] = j; }
for (const [source, job] of Object.entries(perSource)) {
  const res = await fetch(`${BASE}/api/jobs?id=${encodeURIComponent(job.id)}`);
  const detail = await res.json();
  check(res.status === 200 && detail.success === true, `detail ${source} found (${job.id})`);
  if (detail.job) {
    check(detail.job.id === job.id, `detail ${source} id stable`);
    check((detail.job.description ?? "").trim().length > 40, `detail ${source} has description (len=${(detail.job.description ?? "").length})`);
  }
}

// bogus ids
for (const id of ["jobicy-does-not-exist-999999", "micro1-00000000-0000-0000-0000-000000000000", "totally-unknown-123"]) {
  const res = await fetch(`${BASE}/api/jobs?id=${encodeURIComponent(id)}`);
  check(res.status === 404, `bogus id -> 404 (${id} => ${res.status})`);
}

console.log("\n==== RESULT:", fail.length === 0 ? "ALL PASS" : `${fail.length} FAILURES`, "====");
for (const f of fail) console.log(" -", f);
console.log("notes:", note.join(" | "));
process.exit(fail.length === 0 ? 0 : 1);
