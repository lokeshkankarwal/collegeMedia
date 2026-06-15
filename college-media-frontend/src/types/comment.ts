export interface Comment {
  id: string;

  content: string;

  createdAt: string;

  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}