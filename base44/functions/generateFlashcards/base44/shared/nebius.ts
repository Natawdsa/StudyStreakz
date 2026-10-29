import { secrets } from "base44:runtime";

const NEBIUS_URL = "https://api.tokenfactory.nebius.com/v1/chat/completions";
export const NEBIUS_MODEL = "nvidia/nemotron-3-super-120b-a12b";

// Single place that talks to Nebius Token Factory so every AI feature uses the same model + key.
export async function nebiusChat({ messages, maxTokens = 3000, temperature = 0.2 }) {
  const raw = secrets.get("NEBIUS_API_KEY");
  // Keys pasted into a form often carry a trailing newline or wrapping quotes.
  const apiKey = String(raw || "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!apiKey) throw new Error("NEBIUS_API_KEY is not configured");

  const res = await fetch(NEBIUS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NEBIUS_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Nebius API error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Nebius returned an empty response");
  return content;
}

// Models sometimes wrap JSON in ``` fences or add a sentence around it.
export function parseJsonLoose(text) {
  const cleaned = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
}
