import { getPresentationStructureFromGemini, editPresentationStructureFromGemini } from "../utils/gemini.js";

export const generatePPT = async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(`Received topic for PPT generation: ${topic}`);

        // Validate input
        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        // Generate PPT structure from Gemini API
        const presentationJson = await getPresentationStructureFromGemini(topic);

        if (!presentationJson) {
            return res.status(500).json({ success: false, message: "Failed to generate PPT content" });
        }

        // Return the generated PPT structure as preview
        res.status(200).json({
            success: true,
            message: "Presentation generated successfully",
            data: presentationJson,
        });
    } catch (error) {
        console.error("Error in generatePPT controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while generating the presentation",
            error: error.message,
        });
    }
};



export const editPPT = async (req, res) => {
    try {
        const { presentationData, editPrompt } = req.body;
        console.log(`Received edit prompt: ${editPrompt}`);

        // Validate input
        if (!presentationData || !editPrompt) {
            return res.status(400).json({ success: false, message: "Both presentation data and edit prompt are required" });
        }

        // Apply corrections to the generated PPT using the Gemini API
        const updatedPresentationJson = await editPresentationStructureFromGemini(presentationData, editPrompt);

        if (!updatedPresentationJson) {
            return res.status(500).json({ success: false, message: "Failed to edit PPT content" });
        }

        // Return the updated PPT structure as preview
        res.status(200).json({
            success: true,
            message: "Presentation updated successfully",
            data: updatedPresentationJson,
        });
    } catch (error) {
        console.error("Error in editPPT controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while editing the presentation",
            error: error.message,
        });
    }
};



export const previewPPT = async (req, res) => {
    try {
        const { presentationJson } = req.body;

        // Validate input
        if (!presentationJson) {
            return res.status(400).json({ success: false, message: "Presentation data is required" });
        }
        
        res.status(200).json({
            success: true,
            message: "PPT preview generated successfully",
            data: presentationJson,
        });
    } catch (error) {
        console.error("Error in previewPPT controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while generating the PPT preview",
            error: error.message,
        });
    }
};