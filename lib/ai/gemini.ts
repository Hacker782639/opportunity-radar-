const DEFAULT_GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

/*
 * Current Gemini models return thought tokens that are billed against
 * maxOutputTokens, so the requested output budget is topped up to leave room
 * for reasoning plus the JSON response.
 */
const THINKING_TOKEN_HEADROOM = 2048;

const RETRYABLE_STATUSES = new Set([404, 429, 500, 503]);

export type GeminiMessage = {
  role: "system" | "user";
  content: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
};

function modelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();

  return configured && !DEFAULT_GEMINI_MODELS.includes(configured)
    ? [configured, ...DEFAULT_GEMINI_MODELS]
    : [...DEFAULT_GEMINI_MODELS];
}

let preferredModel: string | null = null;

async function requestModel(
  model: string,
  key: string,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number },
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens:
            (options?.maxTokens ?? 1800) + THINKING_TOKEN_HEADROOM,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { retryable: RETRYABLE_STATUSES.has(response.status) };
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return { text, retryable: !text };
}

export async function runGemini(
  messages: GeminiMessage[],
  options?: { temperature?: number; maxTokens?: number },
) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("AI analysis is temporarily unavailable");
  }

  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");

  const candidates = modelCandidates();
  const ordered = preferredModel
    ? [
        preferredModel,
        ...candidates.filter((model) => model !== preferredModel),
      ]
    : candidates;

  for (const model of ordered) {
    const attempt = await requestModel(model, key, prompt, options);

    if (attempt.text) {
      preferredModel = model;

      return attempt.text;
    }

    if (!attempt.retryable) break;
  }

  throw new Error("AI analysis is temporarily unavailable");
}
