import type { Job } from "./types";

export type MatchingProfile = {
  skills?: string[] | null;
  preferred_roles?: string[] | null;
  opportunity_types?: string[] | null;
  experience?: string | null;
  work_preference?: string | null;
  location?: string | null;
};

export type MatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
};

const aliases = new Map<string, string>([
  ["js", "javascript"],
  ["javascript", "javascript"],
  ["ts", "typescript"],
  ["typescript", "typescript"],
  ["next.js", "nextjs"],
  ["nextjs", "nextjs"],
  ["next js", "nextjs"],
  ["react.js", "react"],
  ["reactjs", "react"],
  ["react", "react"],
  ["vue.js", "vue"],
  ["vuejs", "vue"],
  ["angular.js", "angular"],
  ["angularjs", "angular"],
  ["front-end", "frontend"],
  ["front end", "frontend"],
  ["frontend", "frontend"],
  ["full-stack", "fullstack"],
  ["full stack", "fullstack"],
  ["node.js", "nodejs"],
  ["nodejs", "nodejs"],
  ["quality assurance", "qa"],
]);

const roleFamilies = new Map<string, string[]>([
  ["developer", ["engineering"]],
  ["engineer", ["engineering"]],
  ["programming", ["engineering"]],
  ["programmer", ["engineering"]],
  ["designer", ["design"]],
  ["analyst", ["analysis"]],
  ["manager", ["management"]],
]);

const roleSpecializations = new Set([
  "frontend",
  "backend",
  "fullstack",
  "software",
  "web",
  "mobile",
  "data",
  "devops",
  "design",
  "product",
  "marketing",
  "support",
  "sales",
  "security",
  "cloud",
  "ai",
  "machine learning",
  "qa",
]);

function normalize(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ");

  return aliases.get(normalized) ?? normalized;
}

function splitList(value: string) {
  return value
    .split(/[/,;&]| and | \+ /i)
    .map((item) => normalize(item))
    .filter(Boolean);
}

function toList(values?: string[] | null) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function containsPhrase(value: string, phrase: string) {
  return new RegExp(`(^| )${escapeRegExp(phrase)}( |$)`).test(value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRoleFit(title: string, preferredRole: string) {
  const normalizedTitle = normalize(title);
  const normalizedRole = normalize(preferredRole);

  if (!normalizedTitle || !normalizedRole) return 0;

  if (
    normalizedTitle === normalizedRole ||
    containsPhrase(normalizedTitle, normalizedRole) ||
    containsPhrase(normalizedRole, normalizedTitle)
  ) {
    return 1;
  }

  const titleWords = normalizedTitle.split(" ");
  const roleWords = normalizedRole.split(" ");
  const titleSpecializations = titleWords.filter((word) =>
    roleSpecializations.has(word),
  );
  const preferredRoleSpecializations = roleWords.filter((word) =>
    roleSpecializations.has(word),
  );
  const hasSharedSpecialization = titleSpecializations.some((word) =>
    preferredRoleSpecializations.includes(word),
  );
  const titleFamilies = titleWords.flatMap((word) => roleFamilies.get(word) ?? []);
  const roleFamiliesForRole = roleWords.flatMap(
    (word) => roleFamilies.get(word) ?? [],
  );
  const hasSharedFamily = titleFamilies.some((family) =>
    roleFamiliesForRole.includes(family),
  );

  if (hasSharedSpecialization && hasSharedFamily) return 0.9;
  if (hasSharedSpecialization) return 0.75;
  if (hasSharedFamily) return 0.35;

  return 0;
}

function getExperienceLevel(value?: string | null) {
  const normalized = normalize(value ?? "");

  if (!normalized) return null;
  if (normalized.includes("beginner")) return 0;
  if (normalized.includes("entry") || normalized.includes("intern")) return 1;
  if (normalized.includes("junior")) return 2;
  if (normalized.includes("mid")) return 3;
  if (
    normalized.includes("senior") ||
    normalized.includes("lead") ||
    normalized.includes("principal")
  ) {
    return 4;
  }

  return null;
}

export function getOpportunityType(
  job: Pick<Job, "title" | "company" | "location">,
) {
  const text = normalize(`${job.title} ${job.company} ${job.location}`);

  if (text.includes("scholarship")) return "Scholarship" as const;
  if (text.includes("fellowship")) return "Fellowship" as const;
  if (text.includes("grant")) return "Grant" as const;
  if (text.includes("hackathon") || text.includes("coding challenge")) {
    return "Hackathon" as const;
  }

  return "Job" as const;
}

function getOpportunityCategory(job: Job) {
  const type = getOpportunityType(job);

  return type === "Job" ? "Jobs" : `${type}s`;
}

function getWorkPreferenceFit(job: Job, workPreference?: string | null) {
  const preference = normalize(workPreference ?? "");
  const jobLocation = normalize(`${job.location} ${job.remote ? "remote" : ""}`);

  if (!preference) return 0.5;

  if (preference === "remote") {
    return job.remote ? 1 : 0.35;
  }

  if (preference === "hybrid") {
    if (jobLocation.includes("hybrid")) return 1;
    return job.remote ? 0.7 : 0.4;
  }

  if (preference === "on-site" || preference === "onsite" || preference === "on site") {
    if (jobLocation.includes("hybrid")) return 0.6;
    return job.remote ? 0.3 : 1;
  }

  return 0.5;
}

function getLocationFit(job: Job, location?: string | null) {
  const profileLocation = normalize(location ?? "");
  const jobLocation = normalize(job.location);

  if (!profileLocation) return 0.5;
  if (profileLocation === "remote" && job.remote) return 1;
  if (/(worldwide|global|anywhere)/.test(jobLocation)) return 0.75;

  if (
    containsPhrase(jobLocation, profileLocation) ||
    containsPhrase(profileLocation, jobLocation)
  ) {
    return 1;
  }

  return job.remote ? 0.5 : 0.25;
}

export function getJobMatch(
  job: Job,
  profile: MatchingProfile,
): MatchResult {
  const hasProfileData = Boolean(
    profile.skills?.length ||
      profile.preferred_roles?.length ||
      profile.opportunity_types?.length ||
      profile.experience ||
      profile.work_preference ||
      profile.location,
  );
  const neutralFit = hasProfileData ? 0.5 : 0.8;
  const jobSkills = uniqueValues(toList(job.skills));
  const profileSkills = uniqueValues(toList(profile.skills));
  const profileSkillValues = new Set(profileSkills.map(normalize));
  const matchedSkills = jobSkills.filter((skill) =>
    splitList(skill).some((value) => profileSkillValues.has(value)),
  );
  const missingSkills = jobSkills.filter(
    (skill) => !matchedSkills.includes(skill),
  );

  const skillFit =
    jobSkills.length === 0 || profileSkills.length === 0
      ? neutralFit
      : matchedSkills.length / jobSkills.length;

  const preferredRoles = toList(profile.preferred_roles);
  const roleFits = preferredRoles.map((role) => ({
    role,
    fit: getRoleFit(job.title, role),
  }));
  const bestRoleFit = roleFits.reduce(
    (best, current) => (current.fit > best.fit ? current : best),
    { role: "", fit: 0 },
  );
  const roleFit = preferredRoles.length === 0 ? neutralFit : bestRoleFit.fit;

  const profileExperience = getExperienceLevel(profile.experience);
  const jobExperience = getExperienceLevel(job.experience);
  const experienceDifference =
    profileExperience === null || jobExperience === null
      ? null
      : Math.abs(profileExperience - jobExperience);
  const experienceFit =
    experienceDifference === null
      ? neutralFit
      : experienceDifference === 0
        ? 1
        : experienceDifference === 1
          ? 0.75
          : experienceDifference === 2
            ? 0.4
            : 0.1;

  const workPreferenceFit = profile.work_preference
    ? getWorkPreferenceFit(job, profile.work_preference)
    : neutralFit;
  const locationFit = profile.location
    ? getLocationFit(job, profile.location)
    : neutralFit;
  const workFit = workPreferenceFit * 0.7 + locationFit * 0.3;

  const opportunityTypes = uniqueValues(
    toList(profile.opportunity_types).map(normalize),
  );
  const jobCategory = normalize(getOpportunityCategory(job));
  const opportunityTypeFit =
    opportunityTypes.length === 0
      ? neutralFit
      : opportunityTypes.includes(jobCategory)
        ? 1
        : 0;

  const score = Math.round(
    skillFit * 45 +
      roleFit * 25 +
      experienceFit * 15 +
      workFit * 10 +
      opportunityTypeFit * 5,
  );

  const reasons: string[] = [];

  if (matchedSkills.length > 0) {
    reasons.push(
      `Matches ${matchedSkills.length} of ${jobSkills.length} listed skills`,
    );
  }

  if (bestRoleFit.fit >= 0.75) {
    reasons.push(`Strong fit for your ${bestRoleFit.role} preference`);
  }

  if (experienceDifference === 0) {
    reasons.push(`Matches your ${profile.experience} experience level`);
  } else if (experienceDifference === 1) {
    reasons.push(`Close to your ${profile.experience} experience level`);
  }

  const preference = normalize(profile.work_preference ?? "");
  if (preference === "remote" && job.remote) {
    reasons.push("Remote matches your work preference");
  } else if (
    (preference === "on-site" || preference === "onsite") &&
    !job.remote
  ) {
    reasons.push("On-site matches your work preference");
  } else if (preference === "hybrid" && normalize(job.location).includes("hybrid")) {
    reasons.push("Hybrid matches your work preference");
  }

  if (
    profile.location &&
    (getLocationFit(job, profile.location) === 1 ||
      (normalize(profile.location) === "remote" && job.remote))
  ) {
    reasons.push(`Available in ${profile.location}`);
  }

  if (opportunityTypes.length > 0 && opportunityTypes.includes(jobCategory)) {
    reasons.push(`Matches your ${getOpportunityType(job)} interest`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    matchedSkills,
    missingSkills,
    reasons,
  };
}
