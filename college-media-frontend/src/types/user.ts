export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  branch?: string;
  year?: number;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}
