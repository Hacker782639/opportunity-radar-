export const EXPERIENCE_LEVELS = [
  "Student",
  "Beginner",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const WORK_PREFERENCES = ["Remote", "Hybrid", "On-site", "Any"] as const;

export type WorkPreference = (typeof WORK_PREFERENCES)[number];
