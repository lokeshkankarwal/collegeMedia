

export interface Message {
  id: string;

  content?: string;

  senderId: string;

  conversationId: string;

  createdAt: string;

  isRead: boolean;

  attachmentUrl?: string;

  attachmentType?: string;
}