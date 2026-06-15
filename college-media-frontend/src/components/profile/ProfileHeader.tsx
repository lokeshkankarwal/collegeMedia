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
      p-4
      sm:p-6
      mb-4
      sm:mb-6
      w-full
      min-w-0
    "
    >
      {/* Profile layout: column on mobile, row on sm+ */}
      <div
        className="
        flex
        flex-col
        sm:flex-row
        gap-4
        sm:gap-6
        items-center
        sm:items-start
      "
      >
        <img
          src={
            user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`
          }
          alt={user.name}
          className="
          w-20
          h-20
          sm:w-28
          sm:h-28
          rounded-full
          object-cover
          shrink-0
        "
        />

        <div className="flex-1 min-w-0 w-full text-center sm:text-left">
          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            break-words
          "
          >
            {user.name}
          </h1>

          <p
            className="
            text-gray-500
            mt-2
            break-words
          "
          >
            {user.bio}
          </p>

          <div
            className="
            flex
            flex-wrap
            justify-center
            sm:justify-start
            gap-4
            sm:gap-6
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
                w-full
                sm:w-auto
                min-h-[44px]
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
                w-full
                sm:w-auto
                min-h-[44px]
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
