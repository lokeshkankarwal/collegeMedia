export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;

  createdAt: string;

  likesCount: number;
  commentsCount: number;

  likes: {
    userId: string;
  }[];

  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}