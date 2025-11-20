import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Instantiate the SDK
const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set. Please check your .env file.");
}

const googleGenAI = new GoogleGenAI({ apiKey: API_KEY });

// ---- JSON schema (Node SDK style: lower-case types) ----
const presentationSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "content"],
      },
    },
  },
  required: ["title", "subtitle", "slides"],
};

// ---- Small helper: retry with exponential backoff ----
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, maxAttempts = 3, baseDelayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // If it's the last attempt, rethrow
      if (attempt === maxAttempts) break;

      // Simple exponential backoff: base * 2^(attempt-1)
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Gemini call failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`,
        err?.message || err
      );
      await sleep(delay);
    }
  }
  throw lastError;
}

// ---- Helper: safely parse JSON (strips ```json fences if any) ----
function parseJsonFromText(text) {
  if (!text) {
    throw new Error("Empty response text from Gemini.");
  }

  let trimmed = text.trim();

  // Strip ```json ... ``` if the model ever wraps it (shouldn't in JSON mode, but just in case)
  if (trimmed.startsWith("```")) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  }

  return JSON.parse(trimmed);
}

/**
 * Calls the Gemini API to get structured JSON for a presentation.
 * @param {string} topic The topic provided by the user.
 * @returns {Promise<object|null>} The structured JSON data or null on error.
 */
export const getPresentationStructureFromGemini = async (topic) => {
  const system_prompt = `You are an AI assistant specialized in creating presentations.
A user will provide a topic. Your job is to generate the content
for a 5-slide presentation (Title slide + 4 content slides).

You MUST respond with only a valid JSON object that matches the provided schema.
Do not include any other text, markdown formatting, or "json" tags.`;

  const user_prompt = `Create a presentation on the topic: ${topic}`;

  try {
    const response = await withRetry(() =>
      googleGenAI.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025", // or "gemini-2.5-flash" if you prefer the stable name
        contents: user_prompt,
        config: {
          systemInstruction: system_prompt,
          responseMimeType: "application/json",
          responseSchema: presentationSchema,
          temperature: 0.8,
          topP: 0.9,
        },
      })
    );

    const json = parseJsonFromText(response.text);
    return json;
  } catch (e) {
    console.error(
      `An exception occurred in getPresentationStructureFromGemini: ${e.message}`,
      e
    );
    return null;
  }
};

/**
 * Calls the Gemini API to edit an existing presentation structure.
 * @param {object} presentationData The current JSON data of the presentation.
 * @param {string} editPrompt The user's instruction for the edit.
 * @returns {Promise<object|null>} The *new* structured JSON data or null on error.
 */
export const editPresentationStructureFromGemini = async (
  presentationData,
  editPrompt
) => {
  const system_prompt = `You are an AI assistant specialized in editing presentations.
A user will provide a JSON object representing a presentation and an edit instruction.
Your job is to apply the edit and return the complete, modified JSON object.

You MUST respond with only a valid JSON object that matches the provided schema.
Do not include any other text, markdown formatting, or "json" tags.`;

  const user_prompt = `
Here is the current presentation JSON:
${JSON.stringify(presentationData)}

Here is the edit instruction:
"${editPrompt}"

Please apply this edit and return the full, modified JSON.
`;

  try {
    const response = await withRetry(() =>
      googleGenAI.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025",
        contents: user_prompt,
        config: {
          systemInstruction: system_prompt,
          responseMimeType: "application/json",
          responseSchema: presentationSchema,
        },
      })
    );

    const json = parseJsonFromText(response.text);
    return json;
  } catch (e) {
    console.error(
      `An exception occurred in editPresentationStructureFromGemini: ${e.message}`,
      e
    );
    return null;
  }
};
