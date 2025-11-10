import { editPresentationStructureFromGemini } from "../utils/gemini.js";

export const EditDocument = async (req, res) => {
    try {
        const { presentationData, editPrompt } = req.body;
        
        console.log(`EditDocument received prompt: ${editPrompt}`);

        if (!presentationData || !editPrompt) {
            return res.status(400).json({ message: "Presentation data and edit prompt are required" });
        }

        const newPresentationJson = await editPresentationStructureFromGemini(presentationData, editPrompt);

        if (!newPresentationJson) {
            return res.status(500).json({ message: "AI failed to edit content" });
        }

        res.status(200).json({
            success: true,
            data: newPresentationJson,
        });

    } catch (error) {
        console.error("Error in EditDocument controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while processing your edit",
            error: error.message,
        });
    }
};