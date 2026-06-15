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
      p-6
      mb-6
      shadow-sm
    "
    >
      {/* Banner */}

      <div
        className="
        h-40
        rounded-xl
        bg-gradient-to-r
        from-blue-500
        to-purple-500
        mb-6
      "
      />

      <div
        className="
        flex
        justify-between
        items-start
      "
      >
        <div>
          <h1
            className="
            text-3xl
            font-bold
          "
          >
            {community.name}
          </h1>

          <p
            className="
            text-gray-500
            mt-3
            max-w-2xl
          "
          >
            {community.description}
          </p>

          <div
            className="
            flex
            gap-6
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