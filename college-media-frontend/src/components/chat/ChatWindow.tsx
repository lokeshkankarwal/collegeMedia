import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import MessageBubble from "./MessageBubble";

import type {
  Message,
} from "../../types/message";

interface Props {
  messages: Message[];

  currentUserId: string;

  chatName?: string;

  onSend: (
    content: string
  ) => void;

  onTyping: () => void;

  onFileUpload: (
    file: File
  ) => void;

  isTyping: boolean;
}

export default function ChatWindow({
  messages,
  currentUserId,
  chatName,
  onSend,
  onTyping,
  onFileUpload,
  isTyping,
}: Props) {
  const [content, setContent] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  const sendMessage = () => {
    if (!content.trim())
      return;

    onSend(content);

    setContent("");
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    onFileUpload(file);
  };

  return (
    <div
      className="
      flex-1
      flex
      flex-col
      bg-white
      min-w-0
      min-h-0
    "
    >
      <div
        className="
        border-b
        p-3
        sm:p-4
        font-semibold
        text-base
        sm:text-lg
        truncate
      "
      >
        {chatName ||
          "Conversation"}
      </div>

      <div
        className="
        flex-1
        overflow-y-auto
        p-4
        space-y-3
      "
      >
        {messages.map(
          (message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={
                currentUserId
              }
            />
          )
        )}

        <div ref={bottomRef} />
      </div>

      {isTyping && (
        <div
          className="
          px-4
          py-2
          text-sm
          text-gray-500
        "
        >
          Typing...
        </div>
      )}

      <div
        className="
        border-t
        p-3
        sm:p-4
        flex
        flex-wrap
        sm:flex-nowrap
        gap-2
        min-w-0
      "
      >
        <label
          className="
          cursor-pointer
          border
          px-3
          sm:px-4
          py-2
          rounded-lg
          shrink-0
          min-h-[44px]
          flex
          items-center
        "
        >
          📎

          <input
            type="file"
            hidden
            onChange={
              handleFileChange
            }
          />
        </label>

        <input
          type="text"
          value={content}
          placeholder="Type message..."
          onChange={(e) => {
            setContent(
              e.target.value
            );

            onTyping();
          }}
          className="
          flex-1
          min-w-0
          border
          rounded-lg
          p-2
          sm:p-3
          min-h-[44px]
        "
        />

        <button
          onClick={sendMessage}
          className="
          bg-black
          text-white
          px-4
          sm:px-6
          py-2
          rounded-lg
          shrink-0
          min-h-[44px]
        "
        >
          Send
        </button>
      </div>
    </div>
  );
}