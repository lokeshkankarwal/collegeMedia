import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";

import {
  getConversations,
  getMessages,
} from "../services/conversation.service";

import { uploadFile } from "../services/upload.service";

import { socket } from "../services/socket";

import type { Conversation } from "../types/conversation";
import type { Message } from "../types/message";

export default function MessagesPage() {
  const [searchParams] = useSearchParams();

  const urlConversationId =
    searchParams.get("conversation");

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [isTyping, setIsTyping] =
    useState(false);

  const currentUserId =
    localStorage.getItem("userId") || "";

  const selectedConversationData =
    conversations.find(
      (conversation) =>
        conversation.id === selectedConversation
    );

  useEffect(() => {
    loadConversations();

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleMessage = (
      message: Message
    ) => {

      if (
        message.conversationId !==
        selectedConversation
      ) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        message,
      ]);
    };

    const handleTypingEvent = () => {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    };

    socket.on(
      "receiveMessage",
      handleMessage
    );

    socket.on(
      "userTyping",
      handleTypingEvent
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleMessage
      );

      socket.off(
        "userTyping",
        handleTypingEvent
      );
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (
      urlConversationId &&
      conversations.length > 0
    ) {
      openConversation(
        urlConversationId
      );
    }
  }, [
    urlConversationId,
    conversations,
  ]);

  const loadConversations =
    async () => {
      try {
        const data =
          await getConversations();

        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };

  const openConversation =
    async (
      conversationId: string
    ) => {
      try {
        setSelectedConversation(
          conversationId
        );

        socket.emit(
          "joinConversation",
          conversationId
        );

        const data =
          await getMessages(
            conversationId
          );

        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

  const sendMessage = (
    content: string
  ) => {
    if (
      !selectedConversation
    )
      return;

    socket.emit(
      "sendMessage",
      {
        conversationId:
          selectedConversation,
        content,
      }
    );
  };

  const handleTyping =
    () => {
      if (
        !selectedConversation
      )
        return;

      socket.emit(
        "typing",
        {
          conversationId:
            selectedConversation,
        }
      );
    };

  const handleFileUpload =
    async (
      file: File
    ) => {
      try {
        if (
          !selectedConversation
        )
          return;

        const result =
          await uploadFile(
            file
          );

        socket.emit(
          "sendMessage",
          {
            conversationId:
              selectedConversation,
            attachmentUrl:
              result.imageUrl,
            attachmentType:
              "IMAGE",
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  const chatName =
    selectedConversationData?.isGroup
      ? selectedConversationData.name
      : selectedConversationData?.participants?.find(
          (participant) =>
            participant.user.id !==
            currentUserId
        )?.user?.name;

  return (
    <MainLayout>
      <div
        className="
        h-[80vh]
        flex
        border
        rounded-xl
        overflow-hidden
      "
      >
        <ConversationList
          conversations={
            conversations
          }
          selectedId={
            selectedConversation
          }
          currentUserId={
            currentUserId
          }
          onSelect={
            openConversation
          }
        />

        {selectedConversation ? (
          <ChatWindow
            messages={
              messages
            }
            currentUserId={
              currentUserId
            }
            chatName={
              chatName
            }
            onSend={
              sendMessage
            }
            onTyping={
              handleTyping
            }
            onFileUpload={
              handleFileUpload
            }
            isTyping={
              isTyping
            }
          />
        ) : (
          <div
            className="
            flex-1
            flex
            items-center
            justify-center
            text-gray-500
          "
          >
            Select a conversation
          </div>
        )}
      </div>
    </MainLayout>
  );
}