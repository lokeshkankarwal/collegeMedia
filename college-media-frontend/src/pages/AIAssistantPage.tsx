import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCompass,
  FiSend,
  FiTrash2,
  FiBookOpen,
  FiCode,
  FiBriefcase,
  FiEdit3,
  FiZap,
} from "react-icons/fi";
import MainLayout from "../layouts/MainLayout";
import { askAI } from "../services/ai.service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  {
    title: "Campus Post Idea",
    desc: "Generate an engaging post about web development and open source.",
    icon: FiEdit3,
    prompt: "Write an inspiring, engaging post for my college community about starting with web development and open source contributions.",
  },
  {
    title: "Interview Prep",
    desc: "Practice technical and behavioral interview questions for campus hiring.",
    icon: FiBriefcase,
    prompt: "Give me 5 common frontend and full-stack technical interview questions with concise ideal answers.",
  },
  {
    title: "DSA & Problem Solving",
    desc: "Explain complex data structures and algorithmic concepts simply.",
    icon: FiCode,
    prompt: "Explain how Dijkstra's shortest path algorithm works step-by-step with a simple campus map analogy.",
  },
  {
    title: "Exam & Study Notes",
    desc: "Summarize key operating systems or database topics into flashcards.",
    icon: FiBookOpen,
    prompt: "Explain database ACID properties and transaction isolation levels with quick campus examples.",
  },
];

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? prompt).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overridePrompt) {
      setPrompt("");
    }
    setLoading(true);

    try {
      const response = await askAI(textToSend);
      if (response && response.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.answer,
          },
        ]);
      } else {
        throw new Error("No answer received");
      }
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Unable to reach AI assistant. Please try again.";
      toast.error(msg || "AI request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue processing your request. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success("Conversation cleared");
  };

  return (
    <MainLayout wide hideAside contentClassName="pb-4 pt-2 sm:pt-4">
      <div className="flex h-[calc(100dvh-6rem)] sm:h-[calc(100vh-6.5rem)] min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 bg-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100">
              <FiCompass className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Campus AI Assistant
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your intelligent companion for academics, career, and campus life
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              title="Clear chat"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition"
            >
              <FiTrash2 className="text-xs" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>

        {/* Message / Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 bg-[#fafbfc]">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-center max-w-3xl mx-auto py-6">
              <div className="text-center mb-8">
                <div className="inline-grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-100 mb-4">
                  <FiZap className="text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Ask questions about exams, coding problems, career interviews, or draft campus announcements.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(item.prompt)}
                      className="group flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                        <Icon className="text-indigo-500" />
                        {item.title}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-4">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-float-in`}
                  >
                    <div className={`flex items-start gap-3 max-w-[90%] sm:max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
                      {!isUser && (
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shrink-0 mt-0.5 shadow-sm">
                          <FiZap className="text-sm" />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm sm:text-[15px] leading-relaxed break-words shadow-xs ${
                          isUser
                            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-xs font-medium"
                            : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start items-start gap-3 animate-float-in">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shrink-0 mt-0.5 shadow-sm">
                    <FiZap className="text-sm" />
                  </div>
                  <div className="rounded-2xl rounded-bl-xs bg-white border border-slate-200/90 px-4 py-3 text-sm text-slate-600 flex items-center gap-2 shadow-xs">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.3s]" />
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Gemini is thinking…</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition shadow-xs">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about college, coding, or career… (Press Enter to send)"
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-32"
                style={{ minHeight: "38px" }}
              />

              <button
                type="button"
                disabled={!prompt.trim() || loading}
                onClick={() => handleSend()}
                className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-40 disabled:shadow-none shrink-0"
                aria-label="Send prompt"
              >
                <FiSend className="text-sm" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              College Media AI • Responses are generated by AI and should be verified for academic accuracy.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
