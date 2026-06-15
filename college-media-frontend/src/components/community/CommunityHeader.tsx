import type { Community } from "../../types/community";

interface Props {
  community: Community;

  onJoin?: () => void;
}

export default function CommunityHeader({
  community,
  onJoin,
}: Props) {
  return (
    <div
      className="
      bg-white
      border
      rounded-xl
      p-4
      sm:p-6
      mb-4
      sm:mb-6
      shadow-sm
      w-full
      min-w-0
    "
    >
      {/* Banner */}

      <div
        className="
        h-28
        sm:h-36
        md:h-40
        rounded-xl
        bg-gradient-to-r
        from-blue-500
        to-purple-500
        mb-4
        sm:mb-6
      "
      />

      {/* Header content — column on mobile, row on sm+ */}
      <div
        className="
        flex
        flex-col
        sm:flex-row
        justify-between
        items-start
        gap-4
      "
      >
        <div className="min-w-0 flex-1 text-left">
          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            break-words
          "
          >
            {community.name}
          </h1>

          <p
            className="
            text-gray-500
            mt-2
            sm:mt-3
            max-w-2xl
            break-words
          "
          >
            {community.description}
          </p>

          <div
            className="
            flex
            flex-wrap
            gap-4
            sm:gap-6
            mt-4
          "
          >
            <span>
              👥 {community.membersCount} Members
            </span>

            <span>
              🌍 Public Community
            </span>
          </div>
        </div>

        {onJoin && (
          <button
            onClick={onJoin}
            className={`
            px-4
            py-2
            rounded-lg
            w-full
            sm:w-auto
            shrink-0
            min-h-[44px]

            ${
              community.isJoined
                ? "bg-gray-200 text-black"
                : "bg-black text-white"
            }
          `}
          >
            {community.isJoined
              ? "Joined ✓"
              : "Join"}
          </button>
        )}
      </div>
    </div>
  );
}
