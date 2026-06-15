export interface Community {
  id: string;

  name: string;

  description: string;

  membersCount: number;

  isJoined: boolean;

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