import { useState } from "react";
import { Avatar, Button, Modal, EmptyState, UserCardSkeleton } from "../common/UI";
import { api } from "../../services/api";
import type { User } from "../../types/user";

interface Props {
  user: User;
  isMe: boolean;
  onFollow: () => void;
  onEdit: () => void;
}

interface FollowUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

type ModalType = "followers" | "following" | null;

export default function ProfileHeader({ user, isMe, onFollow, onEdit }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [list, setList] = useState<FollowUser[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const openModal = async (type: ModalType) => {
    setModal(type);
    setListLoading(true);
    setList([]);
    try {
      const endpoint = type === "followers"
        ? `/users/${user.id}/followers`
        : `/users/${user.id}/following`;
      const res = await api.get(endpoint);
      setList(res.data || []);
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  };

  const stat = (label: string, value: number, type?: ModalType) => (
    <button
      type="button"
      onClick={() => type && openModal(type)}
      className={`flex flex-col items-center ${type ? "cursor-pointer hover:text-indigo-600 transition" : "cursor-default"}`}
    >
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </button>
  );

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-float-in">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-indigo-500 to-violet-600 sm:h-36" />

        <div className="px-5 pb-5">
          {/* Avatar overlapping banner */}
          <div className="flex flex-wrap items-end justify-between gap-3 -mt-10 sm:-mt-12">
            <div className="ring-4 ring-white rounded-2xl">
              <Avatar name={user.name} src={user.avatarUrl} size="xl" />
            </div>
            <div className="pb-1">
              {isMe ? (
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={user.isFollowing ? "secondary" : "primary"}
                  size="sm"
                  onClick={onFollow}
                >
                  {user.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="mt-3">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{user.name}</h1>
            {user.bio && (
              <p className="mt-1 text-sm text-slate-500 leading-6">{user.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-6">
            {stat("Posts", user.postsCount ?? 0)}
            {stat("Followers", user.followersCount ?? 0, "followers")}
            {stat("Following", user.followingCount ?? 0, "following")}
          </div>
        </div>
      </div>

      {/* Followers/Following Modal */}
      {modal && (
        <Modal
          title={modal === "followers" ? "Followers" : "Following"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {listLoading && [1, 2, 3].map((n) => <UserCardSkeleton key={n} />)}
            {!listLoading && list.length === 0 && (
              <EmptyState
                title={modal === "followers" ? "No followers yet" : "Not following anyone"}
                description=""
              />
            )}
            {!listLoading &&
              list.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50">
                  <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                  <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                </div>
              ))}
          </div>
        </Modal>
      )}
    </>
  );
}
