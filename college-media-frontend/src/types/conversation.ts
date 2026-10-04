export interface ConversationParticipantInfo {
  id?: string;
  userId?: string;
  isAdmin?: boolean;
  isDeleted?: boolean;
  user: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  creatorId?: string;
  participants: ConversationParticipantInfo[];
  messages?: {
    id?: string;
    content?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}
