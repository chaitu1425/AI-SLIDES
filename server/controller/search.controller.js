import { getPresentationStructureFromGemini } from "../utils/gemini.js";

export const SearchQuery = async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(`SearchQuery received: ${topic}`); // Server-side log

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const presentationJson = await getPresentationStructureFromGemini(topic);

        if (!presentationJson) {
            // Error is already logged in the gemini.js util
            return res.status(500).json({ message: "AI failed to generate content" });
        }

        res.status(200).json({
            success: true,
            data: presentationJson,
        });

    } catch (error) {
        console.error("Error in SearchQuery controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request",
            error: error.message,
        });
    }
};