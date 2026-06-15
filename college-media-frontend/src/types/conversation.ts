export interface Conversation {
  id: string;

  name?: string;

  isGroup: boolean;

  participants: {
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }[];

  messages?: {
    content: string;
  }[];
}