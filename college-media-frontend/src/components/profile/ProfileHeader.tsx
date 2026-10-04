import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera } from "react-icons/fi";
import { Avatar, Button, Spinner } from "../common/UI";
import type { User } from "../../types/user";

interface Props {
  user: User;
  isMe: boolean;
  onFollow: () => void;
  onEdit: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  avatarUploading?: boolean;
}

export default function ProfileHeader({
  user,
  isMe,
  onFollow,
  onEdit,
  onAvatarUpload,
  avatarUploading = false,
}: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarUpload) return;
    await onAvatarUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const stat = (label: string, value: number, path?: string) => (
    <button
      type="button"
      onClick={() => path && navigate(path)}
      className={`flex flex-col items-center ${
        path ? "cursor-pointer hover:text-indigo-600 transition" : "cursor-default"
      }`}
    >
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </button>
  );

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-float-in">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-indigo-500 to-violet-600 sm:h-36" />

      <div className="px-5 pb-5">
        {/* Avatar overlapping banner */}
        <div className="flex flex-wrap items-end justify-between gap-3 -mt-10 sm:-mt-12">
          <div className="relative group ring-4 ring-white rounded-2xl">
            <Avatar name={user.name} src={user.avatarUrl} size="xl" />

            {avatarUploading && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50 backdrop-blur-xs">
                <Spinner size="sm" />
              </div>
            )}

            {isMe && onAvatarUpload && (
              <>
                <button
                  type="button"
                  title="Upload profile picture"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FiCamera className="text-xs" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarFile}
                />
              </>
            )}
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
          {stat("Followers", user.followersCount ?? 0, `/followers/${user.id}`)}
          {stat("Following", user.followingCount ?? 0, `/following/${user.id}`)}
        </div>
      </div>
    </div>
  );
}
