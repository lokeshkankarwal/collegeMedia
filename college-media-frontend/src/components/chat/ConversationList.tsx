import { Avatar } from "../common/UI";
import { FiMessageCircle } from "react-icons/fi";
import type { Conversation } from "../../types/conversation";

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  className?: string;
}

export default function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
  loading,
  className = "",
}: Props) {
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

            const isSelected = selectedId === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Avatar name={avatarName} src={avatarSrc} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    {conversation.isGroup && (
                      <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                        Group
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">{preview}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
