import type { User } from "../../types/user";

interface Props {
  user: User;

  isMe: boolean;

  onFollow: () => void;

  onEdit: () => void;
}

export default function ProfileHeader({ user, isMe, onFollow, onEdit }: Props) {
  return (
    <div
      className="
      bg-white
      rounded-xl
      border
      p-6
      mb-6
    "
    >
      <div
        className="
        flex
        gap-6
      "
      >
        <img
          src={
            user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`
          }
          alt={user.name}
          className="
          w-28
          h-28
          rounded-full
        "
        />

        <div className="flex-1">
          <h1
            className="
            text-3xl
            font-bold
          "
          >
            {user.name}
          </h1>

          <p
            className="
            text-gray-500
            mt-2
          "
          >
            {user.bio}
          </p>

          <div
            className="
            flex
            gap-6
            mt-4
          "
          >
            <span>{user.postsCount} Posts</span>

            <span>
              {user.followersCount}
              Followers
            </span>

            <span>
              {user.followingCount}
              Following
            </span>
          </div>

          <div className="mt-4">
            {isMe ? (
              <button
                onClick={onEdit}
                className="
                border
                px-4
                py-2
                rounded-lg
              "
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={onFollow}
                className="
                bg-black
                text-white
                px-4
                py-2
                rounded-lg
              "
              >
                {user.isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
