import { Avatar } from "../common/UI";
import { FiTrash2 } from "react-icons/fi";
import type { Message } from "../../types/message";

interface Props {
  message: Message;
  currentUserId: string;
  canDelete?: boolean;
  onDelete?: (message: Message) => void;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, currentUserId, canDelete, onDelete }: Props) {
  const isMine = message.senderId === currentUserId;
  const allowDelete = Boolean(canDelete || isMine) && Boolean(onDelete);

  return (
    <div className={`group/bubble flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
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
        {/* Sender name for group chats if not mine */}
        {!isMine && message.sender?.name && (
          <p className="text-[10px] font-semibold text-slate-500 px-1">
            {message.sender.name}
          </p>
        )}

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

        {/* Footer: Timestamp and delete action */}
        <div className={`flex items-center gap-1.5 px-0.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <p className="text-[10px] text-slate-400">
            {formatTime(message.createdAt)}
          </p>

          {allowDelete && (
            <button
              type="button"
              title="Delete message"
              onClick={() => onDelete?.(message)}
              className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <FiTrash2 className="text-[11px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
