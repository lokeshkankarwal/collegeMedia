export interface User {
  id: string;

  name: string;

  email: string;

  bio?: string;

  avatarUrl?: string;

  followersCount: number;

  followingCount: number;

  postsCount: number;

  isFollowing?: boolean;
}