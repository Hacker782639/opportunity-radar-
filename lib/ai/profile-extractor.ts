import { runGemini } from "./gemini";
import {
  EXPERIENCE_LEVELS,
  WORK_PREFERENCES,
  type ExperienceLevel,
  type WorkPreference,
} from "../profile/fields";

const MAX_CV_TEXT = 30000;

export type ExtractedCvProfile = {
  fullName: string | null;
  location: string | null;
  experience: ExperienceLevel | null;
  skills: string[];
  preferredRoles: string[];
  workPreference: WorkPreference | null;
  education: string | null;
  currentRole: string | null;
};

function cleanJson(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") return null;

  const text = value.replace(/\s+/g, " ").trim();

  return text ? text.slice(0, maxLength) : null;
}

function normalizeList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of value) {
    const text = normalizeText(item);

    if (!text) continue;

    const key = text.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    items.push(text);

    if (items.length >= limit) break;
  }

  return items;
}

function normalizeOption<T extends string>(
  value: unknown,
  options: readonly T[],
): T | null {
  const text = normalizeText(value);

  if (!text) return null;

  return (
    options.find((option) => option.toLowerCase() === text.toLowerCase()) ??
    null
  );
}

export async function extractProfileFromCv(input: {
  cvText: string;
}): Promise<ExtractedCvProfile> {
  const system = `
You extract structured profile facts from CV text for Opportunity Radar.

Rules:
- Use ONLY information that is explicitly present in the CV text.
- Never guess, infer, or invent names, locations, employers, job titles, dates, education, skills, or preferences.
- When a field is not clearly stated, return null (or an empty array for lists). null is always better than a guess.
- Copy values as they are written in the CV. Do not embellish, translate, or reword.
- skills: only tools, technologies, languages, and competencies named in the CV.
- preferredRoles: only roles the CV explicitly states the candidate wants or is targeting. If the CV does not state target roles, return [].
- currentRole: the candidate's most recent job title exactly as written, or null.
- education: the highest or most recent qualification stated, or null.
- experience: choose ONLY from ${EXPERIENCE_LEVELS.join(", ")}. Pick the level the CV clearly supports through stated years of experience or explicit seniority. If it is unclear, return null.
- workPreference: choose ONLY from ${WORK_PREFERENCES.join(", ")} and only when the CV explicitly states it. Otherwise return null.
- Keep every value short: 160 characters or fewer.

Return ONLY valid JSON using exactly this structure:
{
  "fullName": null,
  "location": null,
  "experience": null,
  "skills": [],
  "preferredRoles": [],
  "workPreference": null,
  "education": null,
  "currentRole": null
}
`;

  const user = JSON.stringify(
    { cvText: input.cvText.slice(0, MAX_CV_TEXT) },
    null,
    2,
  );

  const response = await runGemini(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0, maxTokens: 700 },
  );

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanJson(response));
  } catch {
    console.error("Gemini returned invalid profile extraction JSON");
    throw new Error("AI returned an invalid profile extraction");
  }

  const data = asObject(parsed);

  return {
    fullName: normalizeText(data.fullName),
    location: normalizeText(data.location),
    experience: normalizeOption(data.experience, EXPERIENCE_LEVELS),
    skills: normalizeList(data.skills, 20),
    preferredRoles: normalizeList(data.preferredRoles, 8),
    workPreference: normalizeOption(data.workPreference, WORK_PREFERENCES),
    education: normalizeText(data.education, 200),
    currentRole: normalizeText(data.currentRole),
  };
}
