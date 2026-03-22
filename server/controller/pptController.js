import PptxGenJS from "pptxgenjs";

// Premium themes: each has bg, accent1, accent2, title, body, subtle colors
const THEMES = [
  { // Deep Indigo
    bg: "0D0F1E", panel: "13152B", accent1: "6366F1", accent2: "818CF8",
    title: "FFFFFF", body: "C7D2FE", subtle: "3730A3", tag: "E0E7FF",
  },
  { // Emerald Dark
    bg: "071A14", panel: "0A2520", accent1: "10B981", accent2: "34D399",
    title: "FFFFFF", body: "A7F3D0", subtle: "065F46", tag: "D1FAE5",
  },
  { // Rose / Crimson
    bg: "1A0510", panel: "240A17", accent1: "F43F5E", accent2: "FB7185",
    title: "FFFFFF", body: "FECDD3", subtle: "9F1239", tag: "FFE4E6",
  },
  { // Amber / Gold
    bg: "171209", panel: "221B0E", accent1: "F59E0B", accent2: "FCD34D",
    title: "FFFFFF", body: "FDE68A", subtle: "92400E", tag: "FEF3C7",
  },
  { // Cyan / Sky
    bg: "051B24", panel: "082535", accent1: "06B6D4", accent2: "22D3EE",
    title: "FFFFFF", body: "A5F3FC", subtle: "164E63", tag: "CFFAFE",
  },
  { // Violet / Purple
    bg: "110B1E", panel: "1A1030", accent1: "A855F7", accent2: "C084FC",
    title: "FFFFFF", body: "E9D5FF", subtle: "6B21A8", tag: "F3E8FF",
  },
];

function addTitleSlide(pptx, title, subtitle, theme) {
  const s = pptx.addSlide();
  s.background = { color: theme.bg };

  // Large decorative circle — top right bleed
  s.addShape(pptx.ShapeType.ellipse, {
    x: 9.8, y: -1.8, w: 5.5, h: 5.5,
    fill: { type: "solid", color: theme.subtle },
    line: { type: "none" },
  });

  // Smaller circle — bottom left
  s.addShape(pptx.ShapeType.ellipse, {
    x: -1.2, y: 5.4, w: 3.2, h: 3.2,
    fill: { type: "solid", color: theme.subtle },
    line: { type: "none" },
  });

  // Medium accent circle — right mid
  s.addShape(pptx.ShapeType.ellipse, {
    x: 11.5, y: 2.5, w: 1.8, h: 1.8,
    fill: { type: "solid", color: theme.accent2 },
    line: { type: "none" },
  });

  // Horizontal accent bar
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 2.55, w: 2.4, h: 0.09,
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });

  // Thin secondary line
  s.addShape(pptx.ShapeType.rect, {
    x: 0.6, y: 2.74, w: 1.2, h: 0.04,
    fill: { type: "solid", color: theme.accent2 },
    line: { type: "none" },
  });

  // "AI SLIDES" label — top-left badge
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 0.38, w: 1.5, h: 0.34,
    rectRadius: 0.05,
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });
  s.addText("AI SLIDES", {
    x: 0.5, y: 0.38, w: 1.5, h: 0.34,
    fontSize: 9, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", fontFace: "Calibri",
  });

  // Main title
  s.addText(title || "Untitled Presentation", {
    x: 0.6, y: 0.9, w: 10.5, h: 1.45,
    fontSize: 46, bold: true, color: theme.title,
    align: "left", valign: "bottom", fontFace: "Calibri",
    lineSpacingMultiple: 1.1,
  });

  // Subtitle
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.6, y: 3.0, w: 9.5, h: 0.7,
      fontSize: 20, color: theme.body,
      align: "left", fontFace: "Calibri",
    });
  }

  // Bottom-left decorative dot row
  for (let i = 0; i < 5; i++) {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.6 + i * 0.32, y: 6.6, w: 0.13, h: 0.13,
      fill: { type: "solid", color: i === 0 ? theme.accent1 : theme.subtle },
      line: { type: "none" },
    });
  }

  // Footer line
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.1, w: "100%", h: 0.035,
    fill: { type: "solid", color: theme.subtle },
    line: { type: "none" },
  });
}

function addContentSlide(pptx, slide, index, total, theme) {
  const s = pptx.addSlide();
  s.background = { color: theme.bg };

  // ── Background decorative elements ──

  // Large faded circle — bottom right
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.5, y: 4.2, w: 4.0, h: 4.0,
    fill: { type: "solid", color: theme.subtle },
    line: { type: "none" },
  });

  // Small accent circle — top right
  s.addShape(pptx.ShapeType.ellipse, {
    x: 12.6, y: 0.15, w: 0.9, h: 0.9,
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });

  // Left accent bar (full height)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: "100%",
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });

  // Header panel background
  s.addShape(pptx.ShapeType.rect, {
    x: 0.18, y: 0, w: "100%", h: 1.35,
    fill: { type: "solid", color: theme.panel },
    line: { type: "none" },
  });

  // Accent underline beneath header
  s.addShape(pptx.ShapeType.rect, {
    x: 0.18, y: 1.35, w: "100%", h: 0.055,
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });

  // Slide number badge
  s.addShape(pptx.ShapeType.roundRect, {
    x: 12.0, y: 0.3, w: 0.88, h: 0.38,
    rectRadius: 0.06,
    fill: { type: "solid", color: theme.accent1 },
    line: { type: "none" },
  });
  s.addText(`${index + 1} / ${total}`, {
    x: 12.0, y: 0.3, w: 0.88, h: 0.38,
    fontSize: 10, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", fontFace: "Calibri",
  });

  // Slide title
  s.addText(slide.title || "", {
    x: 0.5, y: 0.15, w: 11.3, h: 1.0,
    fontSize: 28, bold: true, color: theme.title,
    align: "left", valign: "middle", fontFace: "Calibri",
  });

  // Bullet points
  const bullets = (slide.content || []);
  if (bullets.length > 0) {
    const bulletItems = bullets.map((text, bi) => [
      // Colored bullet indicator
      {
        text: "▌",
        options: {
          fontSize: 14, color: theme.accent2,
          bold: true, fontFace: "Calibri",
          paraSpaceBefore: bi === 0 ? 0 : 14,
        },
      },
      {
        text: "  " + text,
        options: {
          fontSize: 17, color: theme.body,
          fontFace: "Calibri",
        },
      },
    ]).flat();

    s.addText(bulletItems, {
      x: 0.5, y: 1.55, w: 11.8, h: 5.1,
      fontFace: "Calibri",
      lineSpacingMultiple: 1.3,
      valign: "top",
    });
  }

  // Footer
  s.addShape(pptx.ShapeType.rect, {
    x: 0.18, y: 7.1, w: "100%", h: 0.035,
    fill: { type: "solid", color: theme.subtle },
    line: { type: "none" },
  });
  s.addText("AI SLIDES", {
    x: 0.3, y: 7.15, w: 2.5, h: 0.28,
    fontSize: 9, color: theme.subtle,
    align: "left", fontFace: "Calibri",
    bold: true,
  });
}

export const downloadPPT = async (req, res) => {
  try {
    const { presentationData } = req.body;
    if (!presentationData) {
      return res.status(400).json({ message: "Presentation data is required" });
    }

    const { title, subtitle, slides } = presentationData;
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"

    // Pick theme from title hash for consistency
    const themeIdx = (title || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % THEMES.length;
    const theme = THEMES[themeIdx];

    addTitleSlide(pptx, title, subtitle, theme);

    for (let i = 0; i < slides.length; i++) {
      addContentSlide(pptx, slides[i], i, slides.length, theme);
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
