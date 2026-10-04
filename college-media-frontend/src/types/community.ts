export interface Community {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  postsCount?: number;
  isJoined: boolean;
  isOwner?: boolean;
  ownerId?: string;
  createdAt?: string;
  owner?: {
    id: string;
    name: string;
  };
  members?: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
}
