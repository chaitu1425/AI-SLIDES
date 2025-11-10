import { getPresentationStructureFromGemini } from "../utils/gemini.js";
import pptxgen from "pptxgenjs";
import { Buffer } from "buffer"; // Import Buffer

/**
 * Creates a PPTX file in memory from the structured JSON.
 * @param {object} presentationData The JSON object from Gemini.
 * @returns {Promise<Buffer>} A buffer containing the PPTX file data.
 */
const createPptFromJs = async (presentationData) => {
    const pptx = new pptxgen();

    // Add Title Slide
    pptx.addSlide()
        .addText(presentationData.title, {
            x: 0.5, y: 2.5, w: 9, h: 1,
            fontSize: 42, bold: true, align: 'center', color: '363636'
        })
        .addText(presentationData.subtitle, {
            x: 0.5, y: 3.5, w: 9, h: 1,
            fontSize: 24, align: 'center', color: '707070'
        });

    // Add Content Slides
    for (const slide of presentationData.slides) {
        const pptSlide = pptx.addSlide();
        
        // Add Slide Title
        pptSlide.addText(slide.title, {
            x: 0.5, y: 0.5, w: 9, h: 0.75,
            fontSize: 28, bold: true, color: '363636'
        });

        // Add Bullet Points
        const bulletPoints = slide.content.map(point => ({ text: point }));
        
        pptSlide.addText(bulletPoints, {
            x: 0.8, y: 1.5, w: 8.5, h: 5,
            fontSize: 18,
            bullet: true,
            paraSpaceBefore: 10, // Spacing between bullet points
            color: '4a4a4a'
        });
    }

    // Generate the file as a Buffer
    const pptBuffer = await pptx.write({ outputType: 'buffer' });
    return pptBuffer;
};

// Main Controller Function
export const GenerateDocument = async (req, res) => {
    try {
        const { topic } = req.body;
        console.log(`GenerateDocument received: ${topic}`);

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        // 1. Get content from Gemini
        const presentationJson = await getPresentationStructureFromGemini(topic);

        if (!presentationJson) {
            return res.status(500).json({ message: "AI failed to generate content" });
        }

        // 2. Build the PPTX file
        const fileBuffer = await createPptFromJs(presentationJson);

        // 3. Send the file for download
        const fileName = `${presentationJson.title.replace(/\s+/g, '_')}_presentation.pptx`;
        
        res.writeHead(200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Content-Length': fileBuffer.length
        });
        res.end(fileBuffer);

    } catch (error) {
        console.error("Error in GenerateDocument controller:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while generating the document",
            error: error.message,
        });
    }
};