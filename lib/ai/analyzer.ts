import { runAgentRouter } from "./agentrouter";

export type AnalyzerMode = "cv" | "opportunity";

export type CvAnalyzerResult = {
  cvSummary: string;
  strongestSkills: string[];
  relevantExperience: string[];
  strengths: string[];
  weakAreas: string[];
  unclearOrMissingInformation: string[];
  skillsNeedingStrongerEvidence: string[];
  recommendations: string[];
  strongestRoleTypes: string[];
};

export type OpportunityAnalyzerResult = {
  assessment: string;
  evidenceFromCv: string[];
  relevantStrengths: string[];
  potentialGaps: string[];
  requirementsToVerify: string[];
  applicationRisks: string[];
  whatToImprove: string[];
  whatToHighlight: string[];
  recommendedAction: "Apply" | "Apply with caution" | "Improve first";
  readiness: "Ready to apply" | "Partially ready" | "Needs preparation";
};

type AgentRouterMessage = {
  role: "system" | "user";
  content: string;
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

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStringArray(value: unknown, limit = 8) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, limit);
}

function normalizeCvResult(value: unknown): CvAnalyzerResult {
  const data = asObject(value);

  return {
    cvSummary: normalizeString(data.cvSummary, "CV analysis completed."),
    strongestSkills: normalizeStringArray(data.strongestSkills),
    relevantExperience: normalizeStringArray(data.relevantExperience),
    strengths: normalizeStringArray(data.strengths),
    weakAreas: normalizeStringArray(data.weakAreas),
    unclearOrMissingInformation: normalizeStringArray(
      data.unclearOrMissingInformation,
    ),
    skillsNeedingStrongerEvidence: normalizeStringArray(
      data.skillsNeedingStrongerEvidence,
    ),
    recommendations: normalizeStringArray(data.recommendations),
    strongestRoleTypes: normalizeStringArray(data.strongestRoleTypes),
  };
}

function normalizeOpportunityResult(
  value: unknown,
  limitedDataNotice?: string,
): OpportunityAnalyzerResult {
  const data = asObject(value);
  let assessment = normalizeString(
    data.assessment,
    "Assessment completed with the available information.",
  );

  if (
    limitedDataNotice &&
    !assessment.toLowerCase().includes("limited analysis:")
  ) {
    assessment = `${limitedDataNotice} ${assessment}`;
  }

  const action = data.recommendedAction;
  const readiness = data.readiness;

  return {
    assessment,
    evidenceFromCv: normalizeStringArray(data.evidenceFromCv),
    relevantStrengths: normalizeStringArray(data.relevantStrengths),
    potentialGaps: normalizeStringArray(data.potentialGaps),
    requirementsToVerify: normalizeStringArray(data.requirementsToVerify),
    applicationRisks: normalizeStringArray(data.applicationRisks),
    whatToImprove: normalizeStringArray(data.whatToImprove),
    whatToHighlight: normalizeStringArray(data.whatToHighlight),
    recommendedAction:
      action === "Apply" || action === "Apply with caution" || action === "Improve first"
        ? action
        : "Improve first",
    readiness:
      readiness === "Ready to apply" ||
      readiness === "Partially ready" ||
      readiness === "Needs preparation"
        ? readiness
        : "Needs preparation",
  };
}

async function runAnalyzer(
  messages: AgentRouterMessage[],
  maxTokens: number,
) {
  const response = await runAgentRouter(messages, {
    temperature: 0.1,
    maxTokens,
  });

  try {
    return JSON.parse(cleanJson(response));
  } catch {
    console.error("AgentRouter returned invalid analyzer JSON");
    throw new Error("AI returned an invalid analysis");
  }
}

export async function analyzeCv(input: {
  cvText: string;
}): Promise<CvAnalyzerResult> {
  const system = `
You are Opportunity Radar's CV Analyzer.

Analyze only the supplied CV text.
Be honest, specific, and evidence-based.
Never invent experience, skills, qualifications, achievements, education, dates, employers, or contact information.
Separate clear evidence from uncertainty.
Do not discriminate based on protected characteristics.

Return ONLY valid JSON using exactly this structure:
{
  "cvSummary": "short factual summary",
  "strongestSkills": ["skill plus the evidence shown in the CV"],
  "relevantExperience": ["relevant experience shown in the CV"],
  "strengths": ["CV strengths supported by evidence"],
  "weakAreas": ["weak areas supported by the CV"],
  "unclearOrMissingInformation": ["important information that is unclear or absent"],
  "skillsNeedingStrongerEvidence": ["skills mentioned without enough supporting evidence"],
  "recommendations": ["practical CV improvements"],
  "strongestRoleTypes": ["role types the CV evidence appears strongest for"]
}

Keep every array concise and practical. Use "Not stated in the CV" rather than guessing.
`;

  const user = JSON.stringify({ cvText: input.cvText }, null, 2);

  return normalizeCvResult(
    await runAnalyzer(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      1800,
    ),
  );
}

export async function analyzeOpportunity(input: {
  cvText?: string;
  opportunity: {
    title: string;
    company: string;
    description?: string;
    experience?: string;
    skills?: string[];
    location?: string;
    remote?: boolean;
    salary?: string;
    source?: string;
  };
  profile?: {
    experience?: string;
    skills?: string[];
    preferredRoles?: string[];
    workPreference?: string;
    location?: string;
  };
}): Promise<OpportunityAnalyzerResult> {
  const description = input.opportunity.description?.trim();
  const skills = input.opportunity.skills ?? [];
  const hasDescription = Boolean(description);
  const hasSkills = skills.length > 0;
  const limitedDataNotice =
    !hasDescription
      ? "Limited analysis: this source does not provide enough job information to reliably assess specific technical requirements."
      : undefined;

  const system = `
You are Opportunity Radar's Opportunity Analyzer.

Answer: "What should I know and do before applying?"
Use the supplied CV, profile, and actual opportunity data.
Be honest and evidence-based.
Be concise. Do not repeat the same point across sections.
Never invent requirements, experience, skills, qualifications, achievements, salary, deadlines, or application details.
If the CV is absent, state that CV evidence is unavailable; do not treat profile fields as CV evidence.
If opportunity details are unavailable, explicitly say requirement-level analysis is limited.
Do not discriminate based on protected characteristics.
Do not provide a numeric match score or percentage.

Return ONLY valid JSON using exactly this structure:
{
  "assessment": "practical assessment of what to know and do before applying",
  "evidenceFromCv": ["CV evidence relevant to this opportunity"],
  "relevantStrengths": ["relevant strengths from CV and profile"],
  "potentialGaps": ["potential skill or experience gaps supported by available data"],
  "requirementsToVerify": ["requirements or details to verify before applying"],
  "applicationRisks": ["risks or unknowns relevant to applying"],
  "whatToImprove": ["what to improve before or while applying"],
  "whatToHighlight": ["what to emphasize in the application"],
  "recommendedAction": "Apply",
  "readiness": "Ready to apply"
}

recommendedAction must be exactly one of:
"Apply", "Apply with caution", "Improve first".
readiness must be exactly one of:
"Ready to apply", "Partially ready", "Needs preparation".
assessment must be one short sentence of 35 words or fewer.
relevantStrengths must contain 2-4 key strengths, each 12 words or fewer.
potentialGaps must contain 2-4 important gaps, each 12 words or fewer.
whatToImprove must contain exactly 2-3 practical improvements, each 15 words or fewer.
Every other array must contain at most 3 directly relevant items, each 12 words or fewer; use an empty array when no evidence exists.
`;

  const user = JSON.stringify(
    {
      cvText: input.cvText ?? null,
      profile: input.profile ?? null,
      opportunity: input.opportunity,
      sourceDataAvailability: {
        description: hasDescription,
        skills: hasSkills,
      },
      limitedDataNotice: limitedDataNotice ?? null,
    },
    null,
    2,
  );

  return normalizeOpportunityResult(
    await runAnalyzer(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      900,
    ),
    limitedDataNotice,
  );
}
