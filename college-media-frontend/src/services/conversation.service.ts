import { api } from "./api";

export const getConversations =
async () => {
  const response =
    await api.get(
      "/conversations"
    );

  return response.data;
};

export const getMessages =
async (
  conversationId: string
) => {
  const response =
    await api.get(
      `/conversations/${conversationId}/messages`
    );

  return response.data;
};

export const createGroupConversation =
  async (
    data: {
      name: string;
      participants: string[];
    }
  ) => {

    const response =
      await api.post(
        "/conversations/group",
        data
      );

    return response.data;
  };


export const createConversation =
  async (
    participantId: string
  ) => {

    const response =
      await api.post(
        "/conversations",
        {
          participantId,
        }
      );

    return response.data;
  };