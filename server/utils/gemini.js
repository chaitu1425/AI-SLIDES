import { GoogleGenAI } from "@google/genai"; // Use the import from your example
import dotenv from 'dotenv';
import pkg from 'exponential-backoff';
const { Backoff } = pkg;

dotenv.config();

// Instantiate the SDK
const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set. Please check your .env file.");
}

// THE FIX: Use the class and instantiation from your code snippet
const googleGenAI = new GoogleGenAI({ apiKey: API_KEY });

// Define the presentation schema
const presentationSchema = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        subtitle: { type: "STRING" },
        slides: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    content: {
                        type: "ARRAY",
                        items: { type: "STRING" }
                    }
                },
                required: ["title", "content"]
            }
        }
    },
    required: ["title", "subtitle", "slides"]
};

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
        // Get the model with the correct config
        const model = googleGenAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025",
            systemInstruction: { parts: [{ text: system_prompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: presentationSchema,
                temperature: 0.8,
                topP: 0.9,
            }
        });
        
        // Use exponential backoff for resilience
        const backoff = new Backoff({
            jitter: "full",
            maxDelay: 5000,
            numOfAttempts: 3
        });

        // THE FIX: Use model.generateContent() for a one-shot call
        const result = await backoff.run(async () => model.generateContent(user_prompt));
        const response = result.response;

        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonText = response.candidates[0].content.parts[0].text;
            return JSON.parse(jsonText);
        } else {
            console.error("Error: Invalid response structure from Gemini.", response);
            return null;
        }
    } catch (e) {
        console.error(`An exception occurred in getPresentationStructureFromGemini: ${e.message}`, e); 
        return null;
    }
};

/**
 * Calls the Gemini API to edit an existing presentation structure.
 * @param {object} presentationData The current JSON data of the presentation.
 * @param {string} editPrompt The user's instruction for the edit.
 * @returns {Promise<object|null>} The *new* structured JSON data or null on error.
 */
export const editPresentationStructureFromGemini = async (presentationData, editPrompt) => {
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
        // Get the model with the correct config
        const model = googleGenAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-09-2025",
            systemInstruction: { parts: [{ text: system_prompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: presentationSchema
            }
        });
        
        const backoff = new Backoff({
            jitter: "full",
            maxDelay: 5000,
            numOfAttempts: 3
        });
        
        // THE FIX: Use model.generateContent() for a one-shot call
        const result = await backoff.run(async () => model.generateContent(user_prompt));
        const response = result.response;

        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonText = response.candidates[0].content.parts[0].text;
            return JSON.parse(jsonText);
        } else {
            console.error("Error: Invalid response structure from Gemini during edit.", response);
            return null;
        }
    } catch (e) {
        console.error(`An exception occurred in editPresentationStructureFromGemini: ${e.message}`, e); 
        return null;
    }
};