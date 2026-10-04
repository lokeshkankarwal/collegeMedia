import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiInfo,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiShield,
  FiUserCheck,
  FiUserMinus,
  FiUserPlus,
  FiUserX,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import MessageBubble from "./MessageBubble";
import { Avatar, Button, ConfirmDialog, Modal, UserCardSkeleton } from "../common/UI";
import {
  updateGroupAdmin,
  addGroupMembers,
  removeGroupMember,
} from "../../services/conversation.service";
import { searchUsers } from "../../services/search.service";
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
  onDeleteMessage?: (message: Message) => void;
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
  onDeleteMessage,
  isTyping,
  onBack,
}: Props) {
  const [content, setContent] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);

  // Group member role change state
  const [confirmAdminChange, setConfirmAdminChange] = useState<{
    target: ConversationParticipantInfo;
    makeAdmin: boolean;
  } | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  // Group remove member state
  const [confirmRemoveMember, setConfirmRemoveMember] =
    useState<ConversationParticipantInfo | null>(null);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);

  // Group add member state
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; avatarUrl?: string }>
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<
    Array<{ id: string; name: string; avatarUrl?: string }>
  >([]);
  const [addMembersLoading, setAddMembersLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Debounced search for adding users to group
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchUserQuery.trim()) {
      setSearchResults([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(searchUserQuery.trim());
        const existingParticipantIds = new Set(
          (conversation?.participants || [])
            .filter((p) => !p.isDeleted)
            .map((p) => p.userId || p.user?.id)
        );
        const filtered = (results || []).filter(
          (u: { id: string; name: string }) => !existingParticipantIds.has(u.id)
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchUserQuery, conversation]);

  const toggleSelectUserToAdd = (user: { id: string; name: string; avatarUrl?: string }) => {
    setSelectedToAdd((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.filter((u) => u.id !== user.id) : [...prev, user];
    });
  };

  const handleAddMembers = async () => {
    if (!conversation || selectedToAdd.length === 0) return;
    setAddMembersLoading(true);
    try {
      await addGroupMembers(
        conversation.id,
        selectedToAdd.map((u) => u.id)
      );
      toast.success(`Added ${selectedToAdd.length} member(s) to group`);
      setSelectedToAdd([]);
      setSearchUserQuery("");
      setShowAddMembers(false);
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to add members";
      toast.error(msg || "Action failed");
    } finally {
      setAddMembersLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!conversation || !confirmRemoveMember) return;
    const targetUserId = confirmRemoveMember.userId || confirmRemoveMember.user?.id;
    if (!targetUserId) return;

    setRemoveMemberLoading(true);
    try {
      await removeGroupMember(conversation.id, targetUserId);
      toast.success(`Removed ${confirmRemoveMember.user?.name || "member"} from group`);
      setConfirmRemoveMember(null);
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to remove member";
      toast.error(msg || "Action failed");
    } finally {
      setRemoveMemberLoading(false);
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
                  {conversation?.participants?.filter((p) => !p.isDeleted)?.length || 0} members
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
            canDelete={isCurrentUserAdmin || message.senderId === currentUserId}
            onDelete={(m) => setDeletingMessage(m)}
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
          onClose={() => {
            setShowGroupModal(false);
            setShowAddMembers(false);
            setSelectedToAdd([]);
            setSearchUserQuery("");
          }}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Group Members
                </p>
                <p className="text-xs text-slate-500">
                  {isCurrentUserAdmin
                    ? "You are an admin of this group."
                    : "Only group admins can manage members and roles."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {conversation.participants?.filter((p) => !p.isDeleted)?.length || 0} total
                </span>
                {isCurrentUserAdmin && !showAddMembers && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddMembers(true)}
                    className="text-xs"
                  >
                    <FiUserPlus /> Add Members
                  </Button>
                )}
              </div>
            </div>

            {/* Add Members Panel */}
            {showAddMembers && (
              <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Add Members to Group
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMembers(false);
                      setSearchUserQuery("");
                      setSelectedToAdd([]);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                {/* Selected chips preview */}
                {selectedToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedToAdd.map((u) => (
                      <span
                        key={u.id}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white px-2.5 py-1 text-xs font-medium"
                      >
                        {u.name}
                        <button
                          type="button"
                          onClick={() => toggleSelectUserToAdd(u)}
                          className="hover:text-indigo-200"
                        >
                          <FiX className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Search users to add..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Search Results */}
                {searchLoading ? (
                  <div className="space-y-1.5 py-1">
                    <UserCardSkeleton />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl bg-white border border-slate-100 p-1.5">
                    {searchResults.map((user) => {
                      const isSelected = selectedToAdd.some((u) => u.id === user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleSelectUserToAdd(user)}
                          className={`flex w-full items-center justify-between gap-2.5 rounded-lg p-2 text-left transition ${
                            isSelected ? "bg-indigo-50 text-indigo-900" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar name={user.name} src={user.avatarUrl} size="xs" />
                            <p className="text-xs font-semibold truncate">{user.name}</p>
                          </div>
                          <div
                            className={`grid h-5 w-5 place-items-center rounded-md border text-xs ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <FiCheck className="text-[10px]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : searchUserQuery.trim() ? (
                  <p className="text-center text-xs text-slate-400 py-2">
                    No matching users found
                  </p>
                ) : null}

                {/* Action button */}
                <div className="flex justify-end pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={selectedToAdd.length === 0}
                    loading={addMembersLoading}
                    onClick={handleAddMembers}
                    className="text-xs"
                  >
                    <FiUserPlus /> Add Selected ({selectedToAdd.length})
                  </Button>
                </div>
              </div>
            )}

            {/* Member List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {(conversation.participants || [])
                .filter((p) => !p.isDeleted)
                .map((p) => {
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

                      {/* Admin controls: visible to admins, not for self, creator protected */}
                      {isCurrentUserAdmin && !isSelf && (
                        <div className="flex items-center gap-1.5 shrink-0">
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
                                <span className="hidden sm:inline">Dismiss Admin</span>
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
                              <span className="hidden sm:inline">Make Admin</span>
                            </Button>
                          )}

                          {/* Remove Member button (Creator cannot be removed; admins can only remove non-admins or creator can remove any admin) */}
                          {!isCreator && (!isAdmin || conversation.creatorId === currentUserId) && (
                            <button
                              type="button"
                              title={`Remove ${memberUser?.name || "member"} from group`}
                              onClick={() => setConfirmRemoveMember(p)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <FiUserMinus className="text-xs" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowGroupModal(false);
                  setShowAddMembers(false);
                }}
              >
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
              ? "As an admin, this member will be able to manage group settings, members, and administrators."
              : "This member will no longer have administrator permissions in this group."
          }
          confirmText={confirmAdminChange.makeAdmin ? "Make Admin" : "Remove Admin"}
          variant={confirmAdminChange.makeAdmin ? "primary" : "danger"}
          loading={adminActionLoading}
          onConfirm={handleAdminToggle}
          onClose={() => setConfirmAdminChange(null)}
        />
      )}

      {/* Confirm Remove Member */}
      {confirmRemoveMember && (
        <ConfirmDialog
          isOpen={true}
          title={`Remove ${confirmRemoveMember.user?.name || "Member"}?`}
          description={`Are you sure you want to remove ${confirmRemoveMember.user?.name || "this user"} from "${conversation?.name || "this group"}"? They will lose access to all messages.`}
          confirmText="Remove Member"
          cancelText="Cancel"
          variant="danger"
          loading={removeMemberLoading}
          onConfirm={handleRemoveMember}
          onClose={() => setConfirmRemoveMember(null)}
        />
      )}

      {/* Confirm Message Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingMessage)}
        title="Delete this message?"
        description="Are you sure you want to delete this message? It will be permanently removed for everyone."
        confirmText="Delete Message"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingMessage && onDeleteMessage) {
            onDeleteMessage(deletingMessage);
          }
          setDeletingMessage(null);
        }}
        onClose={() => setDeletingMessage(null)}
      />
    </div>
  );
}
