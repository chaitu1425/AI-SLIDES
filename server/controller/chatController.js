import Chat from "../models/Chat.js";
import { generatePresentation, editPresentation, getChatResponse, detectIntent } from "../utils/gemini.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, message, currentPresentation } = req.body;
    const userId = req.userId;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Find or create chat
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) return res.status(404).json({ message: "Chat not found" });
    } else {
      const title = message.length > 55 ? message.substring(0, 55) + "…" : message;
      chat = await Chat.create({ userId, title, messages: [], currentPresentation: null });
    }

    // Save user message
    chat.messages.push({ role: "user", content: message });

    const activePres = currentPresentation || chat.currentPresentation || null;
    const intent = detectIntent(message);

    console.log(`[Chat] Intent="${intent}" | "${message.substring(0, 70)}"`);

    let aiText = "";
    let presentationData = null;

    if (intent === "create") {
      // Always call Gemini — no fallback
      presentationData = await generatePresentation(message);
      const count = presentationData?.slides?.length || 0;
      aiText = `I've created a **${count}-slide presentation** titled **"${presentationData.title}"**!\n\nYou can see the full preview on the right. Feel free to ask me to adjust anything — like "make slide 3 more detailed" or "add a slide about X".`;
      chat.currentPresentation = presentationData;

    } else if (intent === "edit" && activePres) {
      // Always call Gemini — no fallback
      presentationData = await editPresentation(activePres, message);
      aiText = `Done! I've updated the presentation based on your feedback. Take a look at the preview — does it look good now?`;
      chat.currentPresentation = presentationData;

    } else if (intent === "edit" && !activePres) {
      // Edge case: user says "edit" but no presentation exists yet
      const history = chat.messages.slice(-8);
      aiText = await getChatResponse(message, history, null);

    } else {
      // Pure chat — always call Gemini
      const history = chat.messages.slice(-8);
      aiText = await getChatResponse(message, history, activePres);
    }

    chat.messages.push({ role: "assistant", content: aiText, presentationData: presentationData || null });
    await chat.save();

    res.status(200).json({
      chatId: chat._id,
      chatTitle: chat.title,
      message: aiText,
      presentationData,
    });

  } catch (error) {
    console.error("[sendMessage] Error:", error.message);

    // Parse Gemini API errors and return clear messages to the client
    let clientMsg = error.message;
    try {
      const parsed = JSON.parse(error.message);
      const status = parsed?.error?.status;
      const code = parsed?.error?.code;
      const detail = parsed?.error?.message || "";

      if (code === 429 || status === "RESOURCE_EXHAUSTED") {
        clientMsg = "⚠️ Gemini API quota exceeded. Your free-tier limit has been reached. Please check your API key billing at https://aistudio.google.com or generate a new key.";
      } else if (code === 401 || code === 403 || status === "PERMISSION_DENIED" || status === "UNAUTHENTICATED") {
        clientMsg = "⚠️ Gemini API key is invalid or unauthorized. Please generate a new key at https://aistudio.google.com/apikey and update your server/.env file.";
      } else if (code === 404 || status === "NOT_FOUND") {
        clientMsg = `⚠️ Gemini model not found: ${detail}. Please update the model name in server/utils/gemini.js.`;
      } else {
        clientMsg = `⚠️ Gemini API error (${code}): ${detail}`;
      }
    } catch {
      // Not a JSON error — use as-is
    }

    res.status(500).json({ message: clientMsg });
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select("_id title updatedAt currentPresentation")
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
