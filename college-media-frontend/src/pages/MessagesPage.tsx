import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { getConversations, getMessages } from "../services/conversation.service";
import { uploadFile } from "../services/upload.service";
import { connectSocket, socket } from "../services/socket";
import { EmptyState } from "../components/common/UI";
import { FiMessageCircle } from "react-icons/fi";
import type { Conversation } from "../types/conversation";
import type { Message } from "../types/message";

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const urlConversationId = searchParams.get("conversation");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const currentUserId = localStorage.getItem("userId") || "";

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );

  // Connect socket once on mount, don't disconnect on unmount
  useEffect(() => {
    connectSocket();
  }, []);

  // Socket event listeners scoped to the selected conversation
  useEffect(() => {
    const handleMessage = (message: Message) => {
      if (message.conversationId !== selectedConversation) return;
      setMessages((prev) => [...prev, message]);
    };

    const handleTypingEvent = () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("userTyping", handleTypingEvent);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("userTyping", handleTypingEvent);
    };
  }, [selectedConversation]);

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch {
      // silently handle
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = useCallback(async (conversationId: string) => {
    setSelectedConversation(conversationId);
    socket.emit("joinConversation", conversationId);
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
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
          loading={convLoading}
          className={selectedConversation ? "hidden md:flex" : "flex"}
        />

        {/* Chat window or empty state */}
        {selectedConversation ? (
          <ChatWindow
            messages={messages}
            currentUserId={currentUserId}
            chatName={chatName}
            onSend={sendMessage}
            onTyping={handleTyping}
            onFileUpload={handleFileUpload}
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
    </MainLayout>
  );
}
