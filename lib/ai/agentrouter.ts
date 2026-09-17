const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-5.6-luna";

type Message = { role: "system" | "user"; content: string };

export async function runAgentRouter(
  messages: Message[],
  options?: { temperature?: number; maxTokens?: number },
) {
  const maxTokens = options?.maxTokens ?? 1800;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini key missing");

    const prompt = messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}`).join("\n\n");

    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: options?.temperature ?? 0.2, maxOutputTokens: maxTokens },
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Gemini failed");

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();

    if (text) return text;
    throw new Error("Gemini empty");
  } catch {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("AI analysis is temporarily unavailable");

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: maxTokens,
      }),
      cache: "no-store",
    });

    if (!res.ok) throw new Error("AI analysis is temporarily unavailable");

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) throw new Error("AI returned an empty response");
    return text;
  }
}
