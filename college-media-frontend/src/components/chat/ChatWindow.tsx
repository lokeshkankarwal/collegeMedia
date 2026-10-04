import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiInfo, FiPaperclip, FiSend, FiShield, FiUserCheck, FiUserX } from "react-icons/fi";
import toast from "react-hot-toast";
import MessageBubble from "./MessageBubble";
import { Avatar, Button, ConfirmDialog, Modal } from "../common/UI";
import { updateGroupAdmin } from "../../services/conversation.service";
import type { Message } from "../../types/message";
import type { Conversation, ConversationParticipantInfo } from "../../types/conversation";

interface Props {
  messages: Message[];
  currentUserId: string;
  chatName?: string;
  conversation?: Conversation;
  onSend: (content: string) => void;
  onTyping: () => void;
  onFileUpload: (file: File) => void;
  onConversationUpdated?: () => void;
  isTyping: boolean;
  onBack?: () => void;
}

export default function ChatWindow({
  messages,
  currentUserId,
  chatName,
  conversation,
  onSend,
  onTyping,
  onFileUpload,
  onConversationUpdated,
  isTyping,
  onBack,
}: Props) {
  const [content, setContent] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [confirmAdminChange, setConfirmAdminChange] = useState<{
    target: ConversationParticipantInfo;
    makeAdmin: boolean;
  } | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

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

  // Group Admin permissions check
  const isGroup = conversation?.isGroup;
  const currentParticipant = conversation?.participants?.find(
    (p) => p.userId === currentUserId || p.user?.id === currentUserId
  );
  const isCurrentUserAdmin =
    Boolean(currentParticipant?.isAdmin) || conversation?.creatorId === currentUserId;

  const handleAdminToggle = async () => {
    if (!conversation || !confirmAdminChange) return;
    const targetUserId = confirmAdminChange.target.userId || confirmAdminChange.target.user?.id;
    if (!targetUserId) return;

    setAdminActionLoading(true);
    try {
      await updateGroupAdmin(
        conversation.id,
        targetUserId,
        confirmAdminChange.makeAdmin
      );
      toast.success(
        confirmAdminChange.makeAdmin
          ? `${confirmAdminChange.target.user.name} is now an Admin`
          : `${confirmAdminChange.target.user.name} is no longer an Admin`
      );
      setConfirmAdminChange(null);
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to update admin permissions";
      toast.error(msg || "Action failed");
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-w-0 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 transition md:hidden shrink-0"
            >
              <FiArrowLeft />
            </button>
          )}
          <Avatar name={chatName || "Chat"} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {chatName || "Conversation"}
              </p>
              {isGroup && (
                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                  {conversation?.participants?.length || 0} members
                </span>
              )}
            </div>
            {isTyping && (
              <p className="text-xs text-indigo-500 animate-pulse">typing…</p>
            )}
          </div>
        </div>

        {isGroup && (
          <button
            type="button"
            title="Group info & members"
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition shrink-0"
          >
            <FiInfo className="text-sm" />
            <span className="hidden sm:inline">Members</span>
          </button>
        )}
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
          onChange={(e) => {
            setContent(e.target.value);
            onTyping();
          }}
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

      {/* Group Info & Admin Management Modal */}
      {showGroupModal && conversation && (
        <Modal
          title={conversation.name || "Group Details"}
          onClose={() => setShowGroupModal(false)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Group Members
                </p>
                <p className="text-xs text-slate-500">
                  {isCurrentUserAdmin
                    ? "You are an admin of this group."
                    : "Only group admins can manage roles."}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {conversation.participants.length} total
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {conversation.participants.map((p) => {
                const memberUser = p.user;
                const memberId = p.userId || memberUser?.id;
                const isCreator = conversation.creatorId === memberId;
                const isAdmin = Boolean(p.isAdmin) || isCreator;
                const isSelf = memberId === currentUserId;

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between gap-3 rounded-2xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar name={memberUser?.name || "Member"} src={memberUser?.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {memberUser?.name}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] text-slate-400 font-medium">(You)</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                              <FiShield className="text-[10px]" />
                              {isCreator ? "Creator & Admin" : "Admin"}
                            </span>
                          ) : (
                            "Member"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Admin actions (only visible to admins, not for self, creator protected) */}
                    {isCurrentUserAdmin && !isSelf && (
                      <div className="shrink-0">
                        {isAdmin ? (
                          !isCreator && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                setConfirmAdminChange({
                                  target: p,
                                  makeAdmin: false,
                                })
                              }
                            >
                              <FiUserX className="text-rose-500" />
                              Dismiss Admin
                            </Button>
                          )
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              setConfirmAdminChange({
                                target: p,
                                makeAdmin: true,
                              })
                            }
                          >
                            <FiUserCheck className="text-indigo-600" />
                            Make Admin
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setShowGroupModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Admin Promotion / Demotion */}
      {confirmAdminChange && (
        <ConfirmDialog
          isOpen={true}
          title={
            confirmAdminChange.makeAdmin
              ? `Make ${confirmAdminChange.target.user?.name} an Admin?`
              : `Remove Admin privileges from ${confirmAdminChange.target.user?.name}?`
          }
          description={
            confirmAdminChange.makeAdmin
              ? "As an admin, this member will be able to manage group settings and other administrators."
              : "This member will no longer have administrator permissions in this group."
          }
          confirmText={confirmAdminChange.makeAdmin ? "Make Admin" : "Remove Admin"}
          variant={confirmAdminChange.makeAdmin ? "primary" : "danger"}
          loading={adminActionLoading}
          onConfirm={handleAdminToggle}
          onClose={() => setConfirmAdminChange(null)}
        />
      )}
    </div>
  );
}
