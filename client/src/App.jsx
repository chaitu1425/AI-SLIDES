import React, { useState } from "react";
import { Send, Loader2, File, ArrowRight, ArrowLeft, Menu, X, MessageSquare, Plus, Download } from "lucide-react";
import axios from 'axios';

const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("landing");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  // Send the request to the backend
  const sendMessageToBackend = async (message) => {
    try {
      const response = await axios.post("http://localhost:8000/api/chat", { message: message });
      return response.data.reply;  // Assuming the response has a `reply` field
    } catch (error) {
      console.error("Error sending message to backend:", error);
      return "Sorry, there was an error.";
    }
  };

  // Handle message send
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    if (phase === "landing") {
      setPhase("chat");
      const newChat = {
        title: input,
        messages: [userMessage],
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChat(newChat);

      setTimeout(() => {
        const botReply = { sender: "bot", text: "How can I help you?" };
        setMessages((prev) => [...prev, botReply]);
        setChats((prev) =>
          prev.map((chat) =>
            chat.title === newChat.title
              ? { ...chat, messages: [...chat.messages, botReply] }
              : chat
          )
        );
      }, 600);

      setInput("");
      return;
    }

    // Normal chat mode with request to backend for different functionalities
    if (input.toLowerCase().includes("ppt")) {
      setIsGenerating(true);
      const genMsg = { sender: "bot", text: "Generating your PPT..." };
      setMessages((prev) => [...prev, genMsg]);

      try {
        const response = await axios.post("http://localhost:8000/api/generate", { message: input });
        setIsGenerating(false);

        const fileMsg = {
          sender: "bot",
          type: "file",
          fileName: "AI_Presentation.pptx",
          text: "Your presentation is ready!",
        };

        setMessages((prev) => [...prev, fileMsg]);
        updateCurrentChat(fileMsg);
      } catch (error) {
        console.error("Error generating PPT:", error);
        const errorMsg = { sender: "bot", text: "Sorry, there was an error generating your PPT." };
        setMessages((prev) => [...prev, errorMsg]);
        setIsGenerating(false);
      }

      setInput("");
      return;
    }

    if (input.toLowerCase().includes("edit")) {
      setIsGenerating(true);
      const editMsg = { sender: "bot", text: "Editing your PPT..." };
      setMessages((prev) => [...prev, editMsg]);

      try {
        const response = await axios.post("http://localhost:8000/api/edit", { message: input });
        setIsGenerating(false);

        const fileMsg = {
          sender: "bot",
          type: "file",
          fileName: "Edited_Presentation.pptx",
          text: "Your presentation has been edited!",
        };

        setMessages((prev) => [...prev, fileMsg]);
        updateCurrentChat(fileMsg);
      } catch (error) {
        console.error("Error editing PPT:", error);
        const errorMsg = { sender: "bot", text: "Sorry, there was an error editing your PPT." };
        setMessages((prev) => [...prev, errorMsg]);
        setIsGenerating(false);
      }

      setInput("");
      return;
    }

    if (input.toLowerCase().includes("preview")) {
      setIsGenerating(true);
      const previewMsg = { sender: "bot", text: "Previewing your PPT..." };
      setMessages((prev) => [...prev, previewMsg]);

      try {
        const response = await axios.post("http://localhost:8000/api/preview", { message: input });
        setIsGenerating(false);

        const fileMsg = {
          sender: "bot",
          type: "file",
          fileName: "Preview_Presentation.pptx",
          text: "Your PPT preview is ready!",
        };

        setMessages((prev) => [...prev, fileMsg]);
        updateCurrentChat(fileMsg);
      } catch (error) {
        console.error("Error previewing PPT:", error);
        const errorMsg = { sender: "bot", text: "Sorry, there was an error previewing your PPT." };
        setMessages((prev) => [...prev, errorMsg]);
        setIsGenerating(false);
      }

      setInput("");
      return;
    }

    setTimeout(async () => {
      const botReply = await sendMessageToBackend(input);
      const botMessage = { sender: "bot", text: botReply };
      setMessages((prev) => [...prev, botMessage]);
      updateCurrentChat(botMessage);
    }, 700);

    updateCurrentChat(userMessage);
    setInput("");
  };

  // Helper to update current chat messages
  const updateCurrentChat = (msg) => {
    if (!currentChat) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.title === currentChat.title
          ? { ...chat, messages: [...chat.messages, msg] }
          : chat
      )
    );
  };

  // Start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setPhase("landing");
    setShowViewer(false);
    setCurrentChat(null);
    setIsSidebarOpen(false);
  };

  // Load a chat from history
  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
    setPhase("chat");
    setIsSidebarOpen(false);
    setShowViewer(false);
  };

  // handle download
  const handleDownload = (fileName) => {
    const blob = new Blob(["This is a simulated PPT file."], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName || "AI_Presentation.pptx";
    link.click();
  };

  return (
    <div className="font-[Outfit] min-h-screen flex bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-500 ease-in-out z-20 ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-neutral-800"
          >
            <X className="h-5 w-5 text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-60px)] justify-between">
          <div className="overflow-y-auto p-3 space-y-2">
            {chats.length > 0 ? (
              chats.map((chat, idx) => (
                <div
                  key={idx}
                  onClick={() => handleChatSelect(chat)}
                  className="flex items-center gap-2 bg-neutral-800 rounded-lg p-2 hover:bg-neutral-700 cursor-pointer transition"
                >
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <p className="text-sm truncate text-gray-300">
                    {chat.title}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center mt-4">
                No chats yet
              </p>
            )}
          </div>

          <div className="p-3 border-t border-neutral-800">
            <button
              onClick={handleNewChat}
              className="w-full bg-indigo-600 hover:bg-indigo-500 transition p-2 rounded-lg text-sm font-medium"
            >
              + New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex relative transition-all duration-500 ${isSidebarOpen ? "ml-64" : "ml-0"
          }`}
      >
        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-700 ${showViewer ? "w-1/2" : "w-full"
            }`}
        >
          {/* Menu Button */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-5 left-5 bg-neutral-900 border border-neutral-800 p-2 rounded-lg hover:bg-neutral-800 transition"
            >
              <Menu className="h-5 w-5 text-gray-300" />
            </button>
          )}

          {/* Landing Page */}
          {phase === "landing" && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
              <h1 className="text-3xl font-semibold mb-6">Ask Anything</h1>
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center px-3 py-2 shadow-lg"
              >
                <input
                  type="text"
                  placeholder="Ask Anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 outline-none text-lg px-2"
                />
                <button
                  type="submit"
                  className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-lg transition"
                >
                  <Send className="h-5 w-5 text-gray-300" />
                </button>
              </form>
            </div>
          )}

          {/* Chat Mode */}
          {phase === "chat" && (
            <div className="flex flex-col flex-1 bg-[#0a0a0a] text-white min-h-screen">
              {/* Chat Messages Section */}
              <div className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                        } transition-all`}
                    >
                      <div
                        className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md leading-relaxed text-sm sm:text-base ${msg.sender === "user"
                          ? "bg-neutral-950 text-white rounded-br-none mr-6 border border-neutral-800"
                          : "bg-neutral-900 text-gray-200 rounded-bl-none ml-6"
                          }`}
                      >
                        {msg.type === "file" ? (
                          <div className="flex flex-col gap-3">
                            <p className="font-medium text-gray-100">
                              {msg.text}
                            </p>
                            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-indigo-400" />
                                <p className="text-sm text-gray-200">
                                  {msg.fileName}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowViewer(true)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-sm px-3 py-1 rounded-md transition"
                                >
                                  Open
                                </button>
                                <button
                                  onClick={() => handleDownload(msg.fileName)}
                                  className="bg-neutral-700 hover:bg-neutral-600 text-sm px-3 py-1 rounded-md transition flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : msg.text.includes("Generating") ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                            <span>{msg.text}</span>
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Bar — same design, just repositioned */}
              <div className="mt-auto w-full flex justify-center px-4 sm:px-8 pb-6">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg px-4 py-2 gap-3"
                >
                  <button
                    type="button"
                    className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded-lg transition"
                  >
                    <Plus className="h-5 w-5 text-gray-400" />
                  </button>
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 outline-none text-lg px-2"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl shadow-md transition"
                  >
                    <Send className="h-5 w-5 text-white" />
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

        {/* Viewer Panel */}
        <div
          className={`bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col items-center justify-center transition-all duration-700 ${showViewer ? "w-1/2 translate-x-0" : "w-0 translate-x-full"
            } overflow-hidden relative`}
        >
          <button
            onClick={() => setShowViewer(false)}
            className="absolute top-4 left-4 bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700 transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </button>

          <h2 className="text-xl font-semibold mb-6">
            AI_Presentation.pptx
          </h2>
          <div className="aspect-video bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 rounded-xl flex items-center justify-center text-3xl font-bold w-full max-w-2xl">
            Slide 1 Preview
          </div>

          <p className="text-gray-400 text-center mt-4">
            Use arrows to navigate slides
          </p>
          <div className="flex gap-3 mt-4">
            <button className="bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700">
              <ArrowLeft className="h-4 w-4 text-gray-300" />
            </button>
            <button className="bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700">
              <ArrowRight className="h-4 w-4 text-gray-300" />
            </button>
            <button onClick={() => handleDownload("AI_Presentation.pptx")} className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg transition flex items-center gap-2">
              <Download className="h-5 w-5 text-white" />
              <span>Download</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
