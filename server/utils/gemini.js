import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const MODEL = "gemini-2.5-flash";

// Lazy initialization — reads the key AFTER dotenv has loaded it
let _ai = null;
function getAI() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set. Add it to server/.env and restart the server.");
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, attempts = 3, delay = 1000) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.error(`[Gemini] Attempt ${i}/${attempts} failed:`, err?.message || err);
      if (i < attempts) await sleep(delay * i);
    }
  }
  throw lastErr;
}

function extractJson(text) {
  if (!text) throw new Error("Empty response from Gemini");
  // Strip markdown code fences if present
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // Find the outermost JSON object
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(t.slice(start, end + 1));
}

export async function generatePresentation(topic) {
  return withRetry(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are a professional presentation designer. Create a detailed, engaging presentation.

Topic: "${topic}"

Return ONLY a valid JSON object with no extra text, markdown, or explanation:
{
  "title": "Compelling Presentation Title",
  "subtitle": "Engaging subtitle or tagline",
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3", "Point 4"]
    }
  ]
}

Rules:
- Create exactly 6 slides
- Each slide must have 3-5 bullet points
- Content must be accurate, informative and well-structured
- No markdown in the JSON values, plain text only
- Return ONLY the JSON, nothing else`,
    });
    return extractJson(response.text);
  });
}

export async function editPresentation(presentationData, editPrompt) {
  return withRetry(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are editing a presentation. Apply this instruction: "${editPrompt}"

Current presentation JSON:
${JSON.stringify(presentationData, null, 2)}

Return ONLY the updated JSON object with the same structure, no extra text:
{
  "title": "...",
  "subtitle": "...",
  "slides": [{"title": "...", "content": ["..."]}]
}`,
    });
    return extractJson(response.text);
  });
}

export async function getChatResponse(userMessage, history = [], presentationContext = null) {
  const ctxLines = presentationContext
    ? `\n[Context: User has a presentation titled "${presentationContext.title}" with ${presentationContext.slides?.length || 0} slides]`
    : "";

  // Build a brief chat history string (last 6 messages)
  const historyStr = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: `You are an AI presentation assistant named "Slides AI". You are friendly, helpful, and conversational.
You can:
- Create professional presentations on any topic
- Edit and improve existing presentations based on feedback
- Answer questions about any subject
- Have natural conversations

${ctxLines}
${historyStr ? `Recent conversation:\n${historyStr}\n` : ""}
User: ${userMessage}

Respond naturally and conversationally. If the user wants a presentation, ask for the topic if not clear, or confirm you'll generate it. Keep response concise (1-3 sentences). Don't use bullet points in chat responses.`,
  });

  return response.text?.trim() || "I'm here to help! Tell me what kind of presentation you'd like to create.";
}

export function detectIntent(message) {
  const lower = message.toLowerCase();

  // ── 1. CREATE — checked first so topic words like "climate change" don't trigger edit ──
  const createPatterns = [
    // "create/generate/build/design/write/prepare/develop ... presentation/slides/deck"
    /\b(create|generate|build|design|write|prepare|develop)\b.{0,60}\b(presentation|ppt|pptx|slides?|deck|slideshow)\b/i,
    // "presentation/slides/deck ... about/on/for X"
    /\b(presentation|ppt|pptx|slides?|deck|slideshow)\b.{0,40}\b(about|on|for|covering|regarding|topic)\b/i,
    // "i need / i want / can you / give me ... presentation/slides"
    /\b(i need|i want|can you|could you|please|show me|give me)\b.{0,30}\b(presentation|slides?|ppt|deck)\b/i,
    // "make A/AN/SOME presentation/slides" — indefinite article = new thing (not edit)
    /\bmake\s+(a|an|some)\s+(presentation|slides?|ppt|deck)\b/i,
    // "slides about/on X"
    /\bslides?\b.{0,30}\b(about|on|for|covering)\b/i,
    // "a presentation" or "new presentation" standing alone
    /\b(a|an|new)\s+presentation\b/i,
  ];
  if (createPatterns.some((p) => p.test(lower))) return "create";

  // ── 2. EDIT — verb directed at an existing slide/presentation element ──
  const editVerbs  = /\b(edit|update|modify|revise|improve|fix|rewrite|rephrase|shorten|expand|lengthen|simplify|clarify|remove|delete|replace)\b/i;
  const editTarget = /\b(slide\s*\d+|slides?|presentation|ppt|title|subtitle|content|bullet|point|heading|section)\b/i;
  // "make slide N X" or "make the presentation/slides X"
  const makeEditTarget = /\bmake\s+(slide\s*\d+|it|that|this|the\s+presentation|the\s+slides?)\b/i;
  if ((editVerbs.test(lower) && editTarget.test(lower)) || makeEditTarget.test(lower)) return "edit";

  // ── 3. CHAT ──
  return "chat";
}
