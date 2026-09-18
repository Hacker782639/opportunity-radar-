const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export type GeminiMessage = {
  role: "system" | "user";
  content: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function runGemini(
  messages: GeminiMessage[],
  options?: { temperature?: number; maxTokens?: number },
) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("AI analysis is temporarily unavailable");
  }

  const maxTokens = options?.maxTokens ?? 1800;
  const prompt = messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");

  const response = await fetch(
    `${GEMINI_URL}?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: maxTokens,
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("AI analysis is temporarily unavailable");
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("AI analysis is temporarily unavailable");
  }

  return text;
}
