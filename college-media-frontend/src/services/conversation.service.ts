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
export const getConversationDetails = async (conversationId: string) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

export const updateGroupAdmin = async (
  conversationId: string,
  targetUserId: string,
  isAdmin: boolean
) => {
  const response = await api.patch(
    `/conversations/${conversationId}/admins/${targetUserId}`,
    { isAdmin }
  );
  return response.data;
};

export const deleteMessage = async (conversationId: string, messageId: string) => {
  const response = await api.delete(`/conversations/${conversationId}/messages/${messageId}`);
  return response.data;
};

export const addGroupMembers = async (conversationId: string, userIds: string[]) => {
  const response = await api.post(`/conversations/${conversationId}/members`, { userIds });
  return response.data;
};

export const removeGroupMember = async (conversationId: string, targetUserId: string) => {
  const response = await api.delete(`/conversations/${conversationId}/members/${targetUserId}`);
  return response.data;
};
