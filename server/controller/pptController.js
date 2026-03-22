import PptxGenJS from "pptxgenjs";
import { verifyToken } from "../middleware/auth.js";

const SLIDE_THEMES = [
  { bg: "1E3A5F", title: "FFFFFF", bullet: "CBD5E1", accent: "6366F1" },
  { bg: "064E3B", title: "FFFFFF", bullet: "D1FAE5", accent: "34D399" },
  { bg: "4C1D95", title: "FFFFFF", bullet: "EDE9FE", accent: "A78BFA" },
  { bg: "1E1B4B", title: "FFFFFF", bullet: "E0E7FF", accent: "818CF8" },
  { bg: "7F1D1D", title: "FFFFFF", bullet: "FEE2E2", accent: "F87171" },
  { bg: "0C4A6E", title: "FFFFFF", bullet: "E0F2FE", accent: "38BDF8" },
];

export const downloadPPT = async (req, res) => {
  try {
    const { presentationData } = req.body;
    if (!presentationData) {
      return res.status(400).json({ message: "Presentation data is required" });
    }

    const { title, subtitle, slides } = presentationData;
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "0F172A" };

    // Gradient rect
    titleSlide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: "100%",
      fill: { type: "solid", color: "0F172A" },
    });
    titleSlide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 2.8, w: 1.5, h: 0.08,
      fill: { type: "solid", color: "6366F1" },
    });

    titleSlide.addText(title || "Untitled Presentation", {
      x: 0.5, y: 1.5, w: 12.3, h: 1.2,
      fontSize: 44, bold: true, color: "FFFFFF",
      align: "left", fontFace: "Calibri",
    });
    titleSlide.addText(subtitle || "", {
      x: 0.5, y: 3.1, w: 12.3, h: 0.7,
      fontSize: 22, color: "94A3B8",
      align: "left", fontFace: "Calibri",
    });
    titleSlide.addText("AI Slides", {
      x: 0.5, y: 6.8, w: 12.3, h: 0.4,
      fontSize: 13, color: "475569",
      align: "left", fontFace: "Calibri",
    });

    // Content slides
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const theme = SLIDE_THEMES[i % SLIDE_THEMES.length];
      const s = pptx.addSlide();
      s.background = { color: "0F172A" };

      // Left color bar
      s.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.15, h: "100%",
        fill: { type: "solid", color: theme.accent },
      });

      // Slide number
      s.addText(`${i + 1} / ${slides.length}`, {
        x: 12, y: 0.2, w: 1.3, h: 0.3,
        fontSize: 11, color: "475569",
        align: "right", fontFace: "Calibri",
      });

      // Title
      s.addText(slide.title || "", {
        x: 0.5, y: 0.3, w: 11.5, h: 0.9,
        fontSize: 30, bold: true, color: "F1F5F9",
        fontFace: "Calibri",
      });

      // Divider
      s.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 1.3, w: 11.5, h: 0.04,
        fill: { type: "solid", color: theme.accent },
      });

      // Bullet points
      const bulletItems = (slide.content || []).map((text) => ({
        text: text,
        options: {
          bullet: { type: "bullet", code: "25CF" },
          fontSize: 18,
          color: "CBD5E1",
          paraSpaceBefore: 8,
          fontFace: "Calibri",
        },
      }));

      if (bulletItems.length > 0) {
        s.addText(bulletItems, {
          x: 0.6, y: 1.5, w: 11.5, h: 4.8,
          fontFace: "Calibri",
          lineSpacingMultiple: 1.25,
        });
      }
    }

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    const safeName = (title || "presentation").replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, "_");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pptx"`);
    res.send(buffer);
  } catch (error) {
    console.error("PPT download error:", error);
    res.status(500).json({ message: `Failed to generate PPTX: ${error.message}` });
  }
};
