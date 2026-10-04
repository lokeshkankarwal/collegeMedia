import { Avatar } from "../common/UI";
import type { Message } from "../../types/message";

interface Props {
  message: Message;
  currentUserId: string;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, currentUserId }: Props) {
  const isMine = message.senderId === currentUserId;

  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && (
        <Avatar
          name={message.sender?.name || "User"}
          src={message.sender?.avatarUrl}
          size="xs"
        />
      )}

      <div
        className={`group flex max-w-[80%] flex-col gap-1 sm:max-w-sm ${
          isMine ? "items-end" : "items-start"
        }`}
      >
        {/* Image attachment */}
        {message.attachmentUrl && message.attachmentType === "IMAGE" && (
          <img
            src={message.attachmentUrl}
            alt="Attachment"
            className="w-full max-w-xs rounded-2xl object-cover border border-slate-100"
            loading="lazy"
          />
        )}

        {/* PDF attachment */}
        {message.attachmentUrl && message.attachmentType === "PDF" && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className={`rounded-2xl px-4 py-3 text-sm underline ${
              isMine ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
            }`}
          >
            📄 Open PDF
          </a>
        )}

        {/* Text */}
        {message.content && (
          <div
            className={`break-words rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${
              isMine
                ? "rounded-br-sm bg-indigo-600 text-white"
                : "rounded-bl-sm bg-slate-100 text-slate-800"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] ${isMine ? "text-slate-400" : "text-slate-400"}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
