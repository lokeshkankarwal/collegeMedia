import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import {
  getConversations,
  getMessages,
  deleteConversation,
  deleteMessage as deleteMessageService,
} from "../services/conversation.service";
import { uploadFile } from "../services/upload.service";
import { connectSocket, socket } from "../services/socket";
import { ConfirmDialog, EmptyState } from "../components/common/UI";
import { FiMessageCircle } from "react-icons/fi";
import type { Conversation } from "../types/conversation";
import type { Message } from "../types/message";

function sortConversations(convList: Conversation[]): Conversation[] {
  return [...convList].sort((a, b) => {
    const timeA = a.messages?.[0]?.createdAt
      ? new Date(a.messages[0].createdAt).getTime()
      : a.updatedAt
      ? new Date(a.updatedAt).getTime()
      : 0;
    const timeB = b.messages?.[0]?.createdAt
      ? new Date(b.messages[0].createdAt).getTime()
      : b.updatedAt
      ? new Date(b.updatedAt).getTime()
      : 0;
    return timeB - timeA;
  });
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const urlConversationId = searchParams.get("conversation");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [deletingConv, setDeletingConv] = useState<Conversation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = localStorage.getItem("userId") || "";

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const data = await getConversations();
      setConversations(sortConversations(data || []));
    } catch {
      // silently handle
    } finally {
      setConvLoading(false);
    }
  }, []);

  // Connect socket once on mount, don't disconnect on unmount
  useEffect(() => {
    connectSocket();
  }, []);

  // Socket event listeners scoped to the selected conversation and conversation list
  useEffect(() => {
    const handleMessage = (message: Message) => {
      // 1. If viewing this conversation, append new message avoiding duplicates
      if (message.conversationId === selectedConversation) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // 2. Update conversation list preview and MOVE TO THE TOP
      setConversations((prev) => {
        const targetConv = prev.find((c) => c.id === message.conversationId);
        if (!targetConv) {
          loadConversations();
          return prev;
        }
        const updatedTarget: Conversation = {
          ...targetConv,
          messages: [message],
          updatedAt: message.createdAt,
        };
        const rest = prev.filter((c) => c.id !== message.conversationId);
        // Move conversation with new message immediately to position 0 (top of list)
        return [updatedTarget, ...rest];
      });
    };

    const handleMessageDeleted = ({
      messageId,
      conversationId,
      lastMessage,
    }: {
      messageId: string;
      conversationId: string;
      lastMessage?: Message | null;
    }) => {
      // 1. Remove deleted message if currently viewed
      if (conversationId === selectedConversation) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }

      // 2. Update conversation list preview with remaining last message and re-sort
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: lastMessage ? [lastMessage] : [],
              updatedAt: lastMessage ? lastMessage.createdAt : c.updatedAt,
            };
          }
          return c;
        });
        return sortConversations(updated);
      });
    };

    const handleRemovedFromGroup = ({ conversationId }: { conversationId: string }) => {
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
        toast("You were removed from this group", { icon: "ℹ️" });
      }
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    };

    const handleGroupMembersUpdated = ({ conversationId }: { conversationId: string }) => {
      loadConversations();
      if (selectedConversation === conversationId) {
        getMessages(conversationId).then((data) => setMessages(data || []));
      }
    };

    const handleTypingEvent = () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("removedFromGroup", handleRemovedFromGroup);
    socket.on("groupMembersUpdated", handleGroupMembersUpdated);
    socket.on("groupInvite", loadConversations);
    socket.on("userTyping", handleTypingEvent);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("removedFromGroup", handleRemovedFromGroup);
      socket.off("groupMembersUpdated", handleGroupMembersUpdated);
      socket.off("groupInvite", loadConversations);
      socket.off("userTyping", handleTypingEvent);
    };
  }, [selectedConversation, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = useCallback(async (conversationId: string) => {
    setSelectedConversation(conversationId);
    socket.emit("joinConversation", conversationId);
    try {
      const data = await getMessages(conversationId);
      setMessages(data || []);
    } catch {
      setMessages([]);
    }
  }, []);

  // Auto-select from URL param once conversations are loaded
  useEffect(() => {
    if (urlConversationId && conversations.length > 0) {
      openConversation(urlConversationId);
    }
  }, [urlConversationId, conversations, openConversation]);

  const sendMessage = (content: string) => {
    if (!selectedConversation) return;
    socket.emit("sendMessage", { conversationId: selectedConversation, content });
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!selectedConversation) return;
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    try {
      await deleteMessageService(selectedConversation, message.id);
      socket.emit("deleteMessage", {
        messageId: message.id,
        conversationId: selectedConversation,
      });
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
      const data = await getMessages(selectedConversation);
      setMessages(data || []);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;
    socket.emit("typing", { conversationId: selectedConversation });
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return;
    try {
      const result = await uploadFile(file);
      socket.emit("sendMessage", {
        conversationId: selectedConversation,
        attachmentUrl: result.imageUrl,
        attachmentType: "IMAGE",
      });
    } catch {
      // silently handle
    }
  };

  const confirmDeleteConversation = async () => {
    if (!deletingConv) return;
    setDeleteLoading(true);
    try {
      await deleteConversation(deletingConv.id);
      setConversations((prev) => prev.filter((c) => c.id !== deletingConv.id));
      if (selectedConversation === deletingConv.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      toast.success("Conversation removed from your chat list");
      setDeletingConv(null);
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeleteLoading(false);
    }
  };

  const chatName = selectedConversationData?.isGroup
    ? selectedConversationData.name
    : selectedConversationData?.participants?.find(
        (p) => p.user.id !== currentUserId
      )?.user?.name;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-10rem)] min-h-[480px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:h-[calc(100vh-6rem)]">
        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation}
          currentUserId={currentUserId}
          onSelect={openConversation}
          onDeleteRequest={(conv) => setDeletingConv(conv)}
          loading={convLoading}
          className={selectedConversation ? "hidden md:flex" : "flex"}
        />

        {/* Chat window or empty state */}
        {selectedConversation ? (
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
            chatName={chatName}
            conversation={selectedConversationData}
            onSend={sendMessage}
            onTyping={handleTyping}
            onFileUpload={handleFileUpload}
            onConversationUpdated={loadConversations}
            onDeleteMessage={handleDeleteMessage}
            isTyping={isTyping}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <EmptyState
              title="No conversation selected"
              description="Choose a conversation from the left to start chatting."
              icon={<FiMessageCircle />}
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Chat Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingConv)}
        title="Delete this chat?"
        description="This conversation will be removed from your chat list. You can restart the conversation at any time."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDeleteConversation}
        onClose={() => setDeletingConv(null)}
      />
    </MainLayout>
  );
}
