import { useNavigate } from "react-router-dom";
import type { Community } from "../../types/community";

interface Props {
  community: Community;

  onJoin: (
    communityId: string
  ) => void;
}

export default function CommunityCard({
  community,
  onJoin,
}: Props) {
  const navigate =
    useNavigate();

  const handleJoin = (
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    onJoin(
      community.id
    );
  };

  return (
    <div
      onClick={() =>
        navigate(
          `/communities/${community.id}`
        )
      }
      className="
      bg-white
      border
      rounded-xl
      p-5
      mb-4
      shadow-sm
      cursor-pointer
      hover:shadow-md
      transition
      "
    >
      {/* Header */}

      <div
        className="
        flex
        justify-between
        items-start
        "
      >
        <div>

          <h2
            className="
            text-xl
            font-bold
            "
          >
            {community.name}
          </h2>

          <p
            className="
            text-gray-500
            mt-2
            "
          >
            {community.description}
          </p>

        </div>

        <button
          onClick={
            handleJoin
          }
          className={`
            px-4
            py-2
            rounded-lg
            font-medium

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
      </div>

      {/* Footer */}

      <div
        className="
        mt-4
        flex
        justify-between
        items-center
        text-sm
        text-gray-500
        "
      >
        <span>
          👥 {community.membersCount} Members
        </span>

        <span>
          Open Community →
        </span>
      </div>
    </div>
  );
}