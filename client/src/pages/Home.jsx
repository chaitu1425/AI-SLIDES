import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Loader2, Plus, Trash2, LogOut, Presentation,
  ChevronLeft, ChevronRight, Download, X, Menu, MessageSquare,
  Sparkles, FileText, CheckCircle2, Layers, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

/* ─── Intent detection (mirrors server) ─────────────────────────────── */
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

/* ─── Generating Card ────────────────────────────────────────────────── */
const STEPS = [
  { icon: Sparkles,      label: "Analyzing topic"       },
  { icon: Layers,        label: "Structuring slides"    },
  { icon: FileText,      label: "Writing content"       },
  { icon: Presentation,  label: "Designing layout"      },
  { icon: CheckCircle2,  label: "Finalizing"            },
];

function GeneratingCard({ topic }) {
  const [step, setStep]       = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const si = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 4000);
    const pi = setInterval(() => setProgress(p => Math.min(p + 2, 90)), 600);
    return () => { clearInterval(si); clearInterval(pi); };
  }, []);

  const fileName = topic
    .replace(/\b(create|make|generate|build|design|write|prepare|develop|a|an|the|please|can you|could you|i need|i want|give me|show me)\b/gi, "")
    .replace(/\b(presentation|ppt|pptx|slides?|deck|slideshow|on|about|for)\b/gi, "")
    .replace(/\s+/g, " ").trim().split(" ").slice(0, 4).join(" ") || "Presentation";

  return (
    <div className="flex items-start mb-5">
      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center mr-3 mt-0.5 shrink-0 shadow-lg shadow-indigo-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="w-72 sm:w-80 rounded-2xl rounded-tl-sm overflow-hidden border border-indigo-500/25 bg-[#1a1d27] shadow-xl shadow-black/30">
        {/* Banner */}
        <div className="relative bg-gradient-to-r from-indigo-700/40 via-purple-700/30 to-blue-700/20 px-4 py-3.5 border-b border-white/5 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Presentation className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/90">Generating Presentation</p>
              <p className="text-[11px] text-indigo-300/70 truncate capitalize mt-0.5">{fileName}.pptx</p>
            </div>
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3.5 pb-2">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-slate-500">Progress</span>
            <span className="text-indigo-400 font-medium tabular-nums">{progress}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 pt-1 pb-4 space-y-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = i < step;
            const active = i === step;
            return (
              <div key={i} className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${done ? "text-emerald-400/80" : active ? "text-slate-100" : "text-slate-600"}`}>
                {done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  : <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-indigo-400 animate-pulse" : "opacity-25"}`} />
                }
                <span className={active ? "font-medium" : ""}>{s.label}</span>
                {active && (
                  <span className="flex gap-0.5 ml-0.5">
                    {[0,150,300].map(d => (
                      <span key={d} className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
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

/* ─── Slide Preview Panel ────────────────────────────────────────────── */
const THEMES = [
  { bg: "from-[#1a1060] via-[#2d1b8e] to-[#1e0f6e]", accent: "#6366f1", dot: "bg-indigo-400" },
  { bg: "from-[#0c2340] via-[#0f3460] to-[#16213e]",  accent: "#3b82f6", dot: "bg-blue-400"   },
  { bg: "from-[#0d3320] via-[#14532d] to-[#052e16]",  accent: "#22c55e", dot: "bg-emerald-400"},
  { bg: "from-[#2d0a4e] via-[#4c1d95] to-[#1e0b3b]",  accent: "#a855f7", dot: "bg-violet-400" },
  { bg: "from-[#3b0d0d] via-[#7f1d1d] to-[#2d0a0a]",  accent: "#ef4444", dot: "bg-rose-400"   },
  { bg: "from-[#0a2540] via-[#0c3a5a] to-[#071a2e]",  accent: "#06b6d4", dot: "bg-cyan-400"   },
];

function SlideCard({ slide, index, total, theme }) {
  return (
    <div className={`relative w-full aspect-video bg-gradient-to-br ${theme.bg} rounded-2xl overflow-hidden flex flex-col select-none`}>
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ background: theme.accent }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15 blur-2xl" style={{ background: theme.accent }} />

      {/* Slide number chip */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-[11px] font-medium text-white/70 tabular-nums">{index + 1} / {total}</span>
      </div>

      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: theme.accent }} />

      {/* Content */}
      <div className="flex flex-col h-full px-7 py-5">
        <h3 className="text-white font-bold text-base sm:text-lg leading-snug mb-3 pr-12">{slide.title}</h3>
        <div className="w-10 h-0.5 rounded mb-3" style={{ background: theme.accent }} />
        <ul className="space-y-2 flex-1 overflow-hidden">
          {(slide.content || []).slice(0, 5).map((pt, i) => (
            <li key={i} className="flex items-start gap-2 text-white/80 text-xs leading-relaxed">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SlidePreview({ presentation, onClose, onDownload, downloading }) {
  const [idx, setIdx] = useState(0);
  const slides = presentation?.slides || [];
  const theme  = THEMES[idx % THEMES.length];
  const prev   = () => setIdx(i => Math.max(0, i - 1));
  const next   = () => setIdx(i => Math.min(slides.length - 1, i + 1));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides.length]);

  // Reset to first slide when presentation changes
  useEffect(() => setIdx(0), [presentation]);

  return (
    <div className="flex flex-col h-full bg-[#111318] border-l border-slate-700/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center shrink-0">
            <Presentation className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{presentation?.title}</p>
            <p className="text-[10px] text-slate-500">{slides.length} slides</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main slide */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
        {/* Current slide */}
        <SlideCard slide={slides[idx]} index={idx} total={slides.length} theme={theme} />

        {/* Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={prev} disabled={idx === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-200 ${i === idx ? "w-4 h-1.5 bg-indigo-500" : "w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400"}`}
              />
            ))}
          </div>

          <button
            onClick={next} disabled={idx === slides.length - 1}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="grid grid-cols-2 gap-2">
          {slides.map((slide, i) => {
            const t = THEMES[i % THEMES.length];
            const active = i === idx;
            return (
              <button
                key={i} onClick={() => setIdx(i)}
                className={`relative rounded-xl overflow-hidden text-left transition-all duration-200 ${active ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#111318]" : "opacity-60 hover:opacity-90"}`}
              >
                <div className={`bg-gradient-to-br ${t.bg} p-2.5`}>
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: t.accent }} />
                  <p className="text-[10px] font-semibold text-white/90 truncate pl-1 leading-tight">{slide.title}</p>
                  <p className="text-[9px] text-white/40 mt-0.5 pl-1">{slide.content?.length || 0} points</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Download */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-700/40 shrink-0">
        <button
          onClick={onDownload} disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-lg shadow-indigo-500/20"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating file…" : "Download .pptx"}
        </button>
      </div>
    </div>
  );
}

/* ─── Chat Message ───────────────────────────────────────────────────── */
function ChatMessage({ msg, onShowPresentation, userName }) {
  const isUser = msg.role === "user";

  if (msg.isGenerating) return <GeneratingCard topic={msg.topic} />;

  if (msg.isThinking) {
    return (
      <div className="flex items-start mb-5">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center mr-3 mt-0.5 shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="bg-[#1a1d27] border border-slate-700/40 rounded-2xl rounded-tl-sm px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay:`${d}ms` }} />)}
          </div>
        </div>
      </div>
    );
  }

  const renderText = (text) =>
    text.split("\n").map((line, li, arr) => {
      const parts = line.split(/\*\*(.*?)\*\*/g).map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p
      );
      return <span key={li}>{parts}{li < arr.length - 1 && <br />}</span>;
    });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center mr-3 mt-0.5 shrink-0 shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
        isUser
          ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/10"
          : msg.isError
          ? "bg-red-950/40 text-red-300 border border-red-700/30 rounded-tl-sm"
          : "bg-[#1a1d27] text-slate-200 border border-slate-700/40 rounded-tl-sm"
      }`}>
        {renderText(msg.content)}
        {msg.presentationData && (
          <button
            onClick={() => onShowPresentation(msg.presentationData)}
            className="mt-3 w-full flex items-center gap-2.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 rounded-xl px-3 py-2.5 transition group"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Presentation className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-left min-w-0">
              <span className="block font-semibold text-indigo-300">{msg.presentationData.slides?.length} slides ready</span>
              <span className="block text-indigo-400/50 text-[10px] truncate">{msg.presentationData.title}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400/50 ml-auto group-hover:text-indigo-300 transition" />
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-indigo-700/60 border border-indigo-600/30 flex items-center justify-center ml-3 mt-0.5 shrink-0">
          <span className="text-xs font-bold text-white">{userName?.[0]?.toUpperCase() || "U"}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Home Component ────────────────────────────────────────────── */
export default function Home() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();

  const [chats, setChats]               = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false); // start closed on all screens
  const [presentation, setPresentation] = useState(null);
  const [downloading, setDownloading]   = useState(false);
  const [loadingChat, setLoadingChat]   = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { api.get("/api/chat").then(r => setChats(r.data)).catch(console.error); }, []);

  const handleNewChat = useCallback(() => {
    setCurrentChatId(null); setMessages([]); setPresentation(null); setSidebarOpen(false);
  }, []);

  const handleSelectChat = async (chat) => {
    if (chat._id === currentChatId) { setSidebarOpen(false); return; }
    setLoadingChat(true);
    setSidebarOpen(false);
    try {
      const res = await api.get(`/api/chat/${chat._id}`);
      setCurrentChatId(res.data._id);
      setMessages(res.data.messages);
      setPresentation(res.data.currentPresentation || null);
    } catch (err) { console.error(err); }
    finally { setLoadingChat(false); }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    await api.delete(`/api/chat/${chatId}`).catch(console.error);
    setChats(p => p.filter(c => c._id !== chatId));
    if (currentChatId === chatId) handleNewChat();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const msgText = input;
    const isGen   = isPresentationRequest(msgText);
    const placeholder = isGen
      ? { role: "assistant", content: "", isGenerating: true, topic: msgText }
      : { role: "assistant", content: "", isThinking: true };

    setMessages(p => [...p, { role: "user", content: msgText }, placeholder]);
    setInput(""); setSending(true);

    try {
      const res = await api.post("/api/chat/message", { chatId: currentChatId, message: msgText, currentPresentation: presentation });
      const { chatId, chatTitle, message: aiText, presentationData } = res.data;
      const realMsg = { role: "assistant", content: aiText, presentationData: presentationData || null };
      setMessages(p => [...p.slice(0, -1), realMsg]);
      if (presentationData) setPresentation(presentationData);
      if (!currentChatId) {
        setCurrentChatId(chatId);
        setChats(p => [{ _id: chatId, title: chatTitle, updatedAt: new Date() }, ...p]);
      } else {
        setChats(p => p.map(c => c._id === chatId ? { ...c, updatedAt: new Date() } : c));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Network error — is the server running?";
      setMessages(p => [...p.slice(0, -1), { role: "assistant", content: msg, isError: true }]);
    } finally { setSending(false); }
  };

  const handleDownload = async () => {
    if (!presentation) return;
    setDownloading(true);
    try {
      const res = await api.post("/api/ppt/download", { presentationData: presentation }, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = `${presentation.title || "presentation"}.pptx`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setDownloading(false); }
  };

  const isLanding   = messages.length === 0;
  const chatTitle   = currentChatId ? (chats.find(c => c._id === currentChatId)?.title || "Chat") : "New Chat";

  const SUGGESTIONS = [
    "Create slides about climate change",
    "Make a presentation on machine learning",
    "Generate slides for a startup pitch",
    "Build a deck about space exploration",
  ];

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden relative">

      {/* ── Sidebar overlay backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col bg-[#13151f] border-r border-slate-700/40 shadow-2xl
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"}
      `}>
        {/* Logo + close */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Presentation className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">AI Slides</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3 pb-2">
          <button onClick={handleNewChat} className="w-full flex items-center gap-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 rounded-xl px-3 py-2.5 text-sm text-indigo-300 hover:text-white transition">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {chats.length === 0 ? (
            <p className="text-[11px] text-slate-600 text-center mt-8 px-3 leading-relaxed">
              No chats yet. Ask me to create a presentation!
            </p>
          ) : chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                chat._id === currentChatId
                  ? "bg-indigo-600/20 text-white border border-indigo-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/40"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs truncate flex-1">{chat.title}</span>
              <button
                onClick={e => handleDeleteChat(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 text-slate-500 transition shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* User row */}
        <div className="px-3 py-3 border-t border-slate-700/40">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-xs text-slate-300 truncate flex-1">{user?.name}</span>
            <button onClick={async () => { await logout(); navigate("/login"); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Chat column ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/40 shrink-0 bg-[#0f1117]/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 rounded-xl hover:bg-slate-700/60 text-slate-400 hover:text-white transition shrink-0"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <span className="text-sm font-medium text-slate-300 truncate flex-1">{chatTitle}</span>
          {presentation && (
            <button
              onClick={() => setPresentation(null)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 transition"
            >
              <Presentation className="w-3.5 h-3.5" /> Preview
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {loadingChat ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : isLanding ? (
            /* ── Landing ── */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
                  <Sparkles className="w-9 h-9 text-indigo-400" />
                </div>
                <div className="absolute -inset-2 bg-indigo-500/5 rounded-3xl blur-xl -z-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Create a Presentation</h2>
              <p className="text-slate-400 text-sm max-w-xs mb-8 leading-relaxed">
                Tell me your topic and I'll instantly generate a professional presentation with beautiful slides.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-slate-400 hover:text-white bg-[#1a1d27] hover:bg-slate-700/50 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl p-3.5 text-left transition group"
                  >
                    <span className="text-indigo-400/50 group-hover:text-indigo-400 transition mr-1.5">→</span>
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
                  userName={user?.name}
                  onShowPresentation={pres => setPresentation(pres)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pb-4 pt-2 shrink-0">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-2.5 bg-[#1a1d27] border border-slate-700/50 focus-within:border-indigo-500/50 rounded-2xl px-4 py-3 transition shadow-lg shadow-black/20"
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              placeholder="Ask me to create a presentation…"
              rows={1}
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none max-h-28 leading-relaxed"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0 shadow-md shadow-indigo-500/20"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-600 mt-2">
            Try: "Create slides about AI" · "Make slide 2 more detailed" · Press <kbd className="bg-slate-800 text-slate-400 px-1 rounded text-[10px]">Enter</kbd> to send
          </p>
        </div>
      </div>

      {/* ── Slide Preview Panel ── */}
      <div className={`
        fixed top-0 right-0 h-full z-20 transition-all duration-300 ease-in-out
        ${presentation ? "translate-x-0 w-80 xl:w-96" : "translate-x-full w-80 xl:w-96"}
        shadow-2xl shadow-black/40
      `}>
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
