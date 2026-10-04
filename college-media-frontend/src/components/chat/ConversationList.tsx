import { useState } from "react";
import { Avatar } from "../common/UI";
import { FiMessageCircle, FiTrash2 } from "react-icons/fi";
import type { Conversation } from "../../types/conversation";

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
  onDeleteRequest?: (conversation: Conversation) => void;
  loading?: boolean;
  className?: string;
}

function formatChatTime(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return "now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
  onDeleteRequest,
  loading,
  className = "",
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className={`w-full flex-col border-r border-slate-200 md:w-72 md:flex shrink-0 overflow-y-auto ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <FiMessageCircle className="text-indigo-500" />
          Messages
        </h2>
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="space-y-1 p-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3 rounded-2xl p-3">
              <div className="skeleton h-11 w-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-2.5 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && conversations.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <FiMessageCircle className="text-3xl text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No conversations yet</p>
          <p className="text-xs text-slate-400">Search for users and start chatting.</p>
        </div>
      )}

      {/* List */}
      {!loading && conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conversation) => {
            const otherUser = conversation.participants?.find(
              (p) => p.user.id !== currentUserId
            )?.user;

            const title = conversation.isGroup ? conversation.name : otherUser?.name;
            const avatarSrc = conversation.isGroup ? undefined : otherUser?.avatarUrl;
            const avatarName = title || "User";
            const preview = conversation.messages?.[0]?.content || "No messages yet";
            const latestTime = conversation.messages?.[0]?.createdAt || conversation.updatedAt;

            const isSelected = selectedId === conversation.id;
            const isHovered = hoveredId === conversation.id;

            return (
              <div
                key={conversation.id}
                onMouseEnter={() => setHoveredId(conversation.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative group mb-1"
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Avatar name={avatarName} src={avatarSrc} size="md" />
                  <div className="min-w-0 flex-1 pr-6">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="truncate text-sm font-semibold">{title}</p>
                        {conversation.isGroup && (
                          <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                            Group
                          </span>
                        )}
                      </div>
                      {latestTime && (
                        <span className="shrink-0 text-[10px] text-slate-400 font-medium">
                          {formatChatTime(latestTime)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-400 mt-0.5">{preview}</p>
                  </div>
                </button>

                {onDeleteRequest && (
                  <button
                    type="button"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRequest(conversation);
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition ${
                      isHovered || isSelected ? "opacity-100" : "opacity-0 md:opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
