import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiPaperclip, FiSend } from "react-icons/fi";
import MessageBubble from "./MessageBubble";
import { Avatar } from "../common/UI";
import type { Message } from "../../types/message";

interface Props {
  messages: Message[];
  currentUserId: string;
  chatName?: string;
  onSend: (content: string) => void;
  onTyping: () => void;
  onFileUpload: (file: File) => void;
  isTyping: boolean;
  onBack?: () => void;
}

export default function ChatWindow({
  messages,
  currentUserId,
  chatName,
  onSend,
  onTyping,
  onFileUpload,
  isTyping,
  onBack,
}: Props) {
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!content.trim()) return;
    onSend(content);
    setContent("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileUpload(file);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-1 min-w-0 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 transition md:hidden"
          >
            <FiArrowLeft />
          </button>
        )}
        <Avatar name={chatName || "Chat"} size="sm" />
        <div>
          <p className="font-semibold text-slate-900 text-sm truncate">{chatName || "Conversation"}</p>
          {isTyping && (
            <p className="text-xs text-indigo-500 animate-pulse">typing…</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-slate-400">No messages yet.</p>
            <p className="text-xs text-slate-300">Say hello! 👋</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}
        {isTyping && !messages.length && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-bounce" />
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.15s]" />
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:.3s]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator (bottom) */}
      {isTyping && messages.length > 0 && (
        <div className="px-4 pb-1">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:.15s]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:.3s]" />
            <span className="ml-1">typing…</span>
          </span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
        >
          <FiPaperclip />
        </button>
        <input ref={fileRef} type="file" hidden onChange={handleFileChange} />

        <input
          type="text"
          value={content}
          placeholder="Type a message…"
          onChange={(e) => { setContent(e.target.value); onTyping(); }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!content.trim()}
          aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiSend className="text-sm" />
        </button>
      </div>
    </div>
  );
}
