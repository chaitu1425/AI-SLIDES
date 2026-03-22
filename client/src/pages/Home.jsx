import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Loader2, Plus, Trash2, LogOut, Presentation,
  ChevronLeft, ChevronRight, Download, X, Menu, MessageSquare,
  Sparkles, FileText, CheckCircle2, Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// Mirrors server detectIntent — create branch only (same patterns, same order)
function isPresentationRequest(msg) {
  const lower = msg.toLowerCase();
  return (
    /\b(create|generate|build|design|write|prepare|develop)\b.{0,60}\b(presentation|ppt|pptx|slides?|deck|slideshow)\b/i.test(lower) ||
    /\b(presentation|ppt|pptx|slides?|deck|slideshow)\b.{0,40}\b(about|on|for|covering|regarding|topic)\b/i.test(lower) ||
    /\b(i need|i want|can you|could you|please|show me|give me)\b.{0,30}\b(presentation|slides?|ppt|deck)\b/i.test(lower) ||
    /\bmake\s+(a|an|some)\s+(presentation|slides?|ppt|deck)\b/i.test(lower) ||
    /\bslides?\b.{0,30}\b(about|on|for|covering)\b/i.test(lower) ||
    /\b(a|an|new)\s+presentation\b/i.test(lower)
  );
}

const GENERATION_STEPS = [
  { icon: Sparkles,     label: "Analyzing your topic…"       },
  { icon: Layers,       label: "Structuring the slides…"     },
  { icon: FileText,     label: "Writing slide content…"      },
  { icon: Presentation, label: "Designing the layout…"       },
  { icon: CheckCircle2, label: "Finalizing presentation…"    },
];

function GeneratingCard({ topic }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(8);

  // Advance through steps over ~20 s (typical Gemini time)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, GENERATION_STEPS.length - 1));
    }, 4000);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 3, 90)); // never hits 100 until real data arrives
    }, 700);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Extract a clean file-name-like label from the raw message
  const fileName = topic
    .replace(/\b(create|make|generate|build|design|write|prepare|develop|a|an|the|please|can you|could you|i need|i want)\b/gi, "")
    .replace(/\b(presentation|ppt|pptx|slides?|deck|slideshow|on|about|for)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join(" ") || "Presentation";

  return (
    <div className="flex items-start mb-4">
      {/* AI avatar */}
      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Card */}
      <div className="max-w-[78%] w-full sm:w-80 rounded-2xl rounded-bl-sm overflow-hidden border border-indigo-500/30 bg-[#1a1d27]">
        {/* Top gradient banner */}
        <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/20 px-4 py-3 flex items-center gap-2.5 border-b border-indigo-500/20">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Presentation className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-indigo-200 leading-tight">Generating Presentation</p>
            <p className="text-xs text-indigo-400/70 truncate capitalize">{fileName}.pptx</p>
          </div>
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin ml-auto shrink-0" />
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-xs text-indigo-400 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 pt-2 pb-4 space-y-1.5">
          {GENERATION_STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  done
                    ? "text-emerald-400/80"
                    : active
                    ? "text-slate-200"
                    : "text-slate-600"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : active ? (
                  <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-30" />
                )}
                <span className={active ? "font-medium" : ""}>{s.label}</span>
                {active && (
                  <span className="flex gap-0.5 ml-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SLIDE_GRADIENTS = [
  "from-indigo-900 to-purple-900",
  "from-blue-900 to-cyan-900",
  "from-emerald-900 to-teal-900",
  "from-violet-900 to-fuchsia-900",
  "from-rose-900 to-pink-900",
  "from-slate-800 to-slate-900",
];

const ACCENT_BORDERS = [
  "border-indigo-500",
  "border-blue-500",
  "border-emerald-500",
  "border-violet-500",
  "border-rose-500",
  "border-slate-500",
];

function SlidePreview({ presentation, onClose, onDownload, downloading }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = presentation?.slides || [];
  const current = slides[slideIndex];
  const gradient = SLIDE_GRADIENTS[slideIndex % SLIDE_GRADIENTS.length];
  const accentBorder = ACCENT_BORDERS[slideIndex % ACCENT_BORDERS.length];

  return (
    <div className="flex flex-col h-full bg-[#13151f] border-l border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Presentation className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-medium text-slate-200 truncate">{presentation?.title}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition ml-2 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Slide display */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Current slide */}
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border-l-4 ${accentBorder} min-h-[200px] flex flex-col`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Slide {slideIndex + 1} / {slides.length}
            </span>
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === slideIndex ? "bg-white" : "bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
          <h3 className="text-base font-bold text-white mb-3 leading-tight">{current?.title}</h3>
          <ul className="space-y-2 flex-1">
            {(current?.content || []).map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/85">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-slate-500">{slideIndex + 1} / {slides.length}</span>
          <button
            onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
            disabled={slideIndex === slides.length - 1}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`text-left rounded-xl p-3 border transition ${
                i === slideIndex
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700/50 bg-[#1a1d27] hover:border-slate-600"
              }`}
            >
              <span className="block text-xs font-semibold text-slate-300 truncate">{slide.title}</span>
              <span className="block text-xs text-slate-500 mt-0.5">{slide.content?.length || 0} points</span>
            </button>
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="p-4 border-t border-slate-700/50 shrink-0">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition text-sm"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating…" : "Download .pptx"}
        </button>
      </div>
    </div>
  );
}

function ChatMessage({ msg, onShowPresentation }) {
  const isUser = msg.role === "user";

  // Generating card — persisted in messages array
  if (msg.isGenerating) {
    return <GeneratingCard topic={msg.topic} />;
  }

  // Plain thinking dots for non-presentation responses
  if (msg.isThinking) {
    return (
      <div className="flex items-start mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  // Render text: handle **bold** and newlines
  const renderText = (text) => {
    return text.split("\n").map((line, li) => {
      const parts = line.split(/\*\*(.*?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
      );
      return (
        <span key={li}>
          {parts}
          {li < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-sm"
            : msg.isError
            ? "bg-red-950/50 text-red-300 border border-red-700/40 rounded-bl-sm"
            : "bg-[#1a1d27] text-slate-200 border border-slate-700/50 rounded-bl-sm"
        }`}
      >
        {renderText(msg.content)}
        {msg.presentationData && (
          <button
            onClick={() => onShowPresentation(msg.presentationData)}
            className="mt-3 w-full flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-2 transition cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">{msg.presentationData.slides?.length} slides ready</span>
            <span className="text-indigo-400/60 ml-auto">Click to view →</span>
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center ml-2.5 mt-0.5 shrink-0">
          <span className="text-xs font-bold text-slate-300">
            {msg.userName?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [presentation, setPresentation] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    api.get("/api/chat").then((res) => setChats(res.data)).catch(console.error);
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setPresentation(null);
  };

  const handleSelectChat = async (chat) => {
    if (chat._id === currentChatId) return;
    setLoadingChat(true);
    try {
      const res = await api.get(`/api/chat/${chat._id}`);
      setCurrentChatId(res.data._id);
      setMessages(res.data.messages);
      setPresentation(res.data.currentPresentation || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    await api.delete(`/api/chat/${chatId}`).catch(console.error);
    setChats((prev) => prev.filter((c) => c._id !== chatId));
    if (currentChatId === chatId) handleNewChat();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const msgText = input;
    const isGenRequest = isPresentationRequest(msgText);

    // Build the placeholder AI message — either a generating card or plain dots
    const placeholderMsg = isGenRequest
      ? { role: "assistant", content: "", isGenerating: true, topic: msgText }
      : { role: "assistant", content: "", isThinking: true };

    setMessages((prev) => [...prev, { role: "user", content: msgText }, placeholderMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/api/chat/message", {
        chatId: currentChatId,
        message: msgText,
        currentPresentation: presentation,
      });

      const { chatId, chatTitle, message: aiText, presentationData } = res.data;
      const realMsg = { role: "assistant", content: aiText, presentationData: presentationData || null };

      // Replace the placeholder (last message) with the real response
      setMessages((prev) => [...prev.slice(0, -1), realMsg]);

      if (presentationData) setPresentation(presentationData);

      if (!currentChatId) {
        setCurrentChatId(chatId);
        setChats((prev) => [{ _id: chatId, title: chatTitle, updatedAt: new Date() }, ...prev]);
      } else {
        setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, updatedAt: new Date() } : c)));
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || "Network error — is the server running?";
      // Replace the placeholder with the error
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: serverMsg, isError: true }]);
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async () => {
    if (!presentation) return;
    setDownloading(true);
    try {
      const res = await api.post("/api/ppt/download", { presentationData: presentation }, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title || "presentation"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isLanding = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-0"
        } shrink-0 flex flex-col bg-[#1a1d27] border-r border-slate-700/50 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/50 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Presentation className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white text-sm">AI Slides</span>
        </div>

        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-700/60 rounded-xl px-3 py-2.5 transition"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {chats.length === 0 ? (
            <p className="text-xs text-slate-500 text-center mt-6 px-2 leading-relaxed">
              No chats yet.{"\n"}Ask me to create a presentation!
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                  chat._id === currentChatId
                    ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/40"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs truncate flex-1">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-3 border-t border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-xs text-slate-300 truncate flex-1">{user?.name}</span>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition" title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/50 shrink-0">
          <button onClick={() => setSidebarOpen((v) => !v)} className="text-slate-400 hover:text-white transition">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-slate-300 truncate">
            {currentChatId ? chats.find((c) => c._id === currentChatId)?.title || "Chat" : "New Chat"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {loadingChat ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : isLanding ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Create a Presentation</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                Tell me your topic and I'll generate a professional presentation complete with slides and bullet points.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md text-left">
                {[
                  "Create slides about climate change",
                  "Make a presentation on machine learning",
                  "Generate slides for a startup pitch",
                  "Build a deck about healthy eating habits",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-slate-400 hover:text-white bg-[#1a1d27] hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600 rounded-xl p-3 text-left transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  msg={msg}
                  onShowPresentation={(pres) => setPresentation(pres)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pb-4 shrink-0">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 bg-[#1a1d27] border border-slate-700/50 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask me to create a presentation…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none max-h-32"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
          <p className="text-center text-xs text-slate-600 mt-2">
            Tip: "Create a presentation about AI" · "Edit slide 2 to be more concise"
          </p>
        </div>
      </div>

      {/* Slide Preview Panel */}
      <div
        className={`${
          presentation ? "w-80 xl:w-96" : "w-0"
        } shrink-0 transition-all duration-300 overflow-hidden`}
      >
        {presentation && (
          <SlidePreview
            presentation={presentation}
            onClose={() => setPresentation(null)}
            onDownload={handleDownload}
            downloading={downloading}
          />
        )}
      </div>
    </div>
  );
}
