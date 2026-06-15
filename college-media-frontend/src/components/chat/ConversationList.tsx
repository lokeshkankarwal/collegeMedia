import type {
  Conversation,
} from "../../types/conversation";

interface Props {
  conversations: Conversation[];

  selectedId: string | null;

  currentUserId: string;

  onSelect: (
    id: string
  ) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
}: Props) {
  /* Responsive: full-width list on mobile (capped height), fixed sidebar on md+ */
  return (
    <div
      className="
      w-full
      md:w-80
      shrink-0
      border-r
      border-b
      md:border-b-0
      overflow-y-auto
      bg-white
      max-h-[35vh]
      md:max-h-none
      md:h-auto
    "
    >
      <div
        className="
        p-4
        border-b
      "
      >
        <h2
          className="
          text-xl
          font-bold
        "
        >
          Messages
        </h2>
      </div>

      {conversations.map(
        (conversation) => {

          const otherUser =
            conversation.participants?.find(
              (participant) =>
                participant.user.id !==
                currentUserId
            )?.user;

          const title =
            conversation.isGroup
              ? conversation.name
              : otherUser?.name;

          const avatar =
            conversation.isGroup
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  conversation.name ||
                    "Group"
                )}`
              : otherUser?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherUser?.name ||
                    "User"
                )}`;

          return (
            <button
              key={conversation.id}
              onClick={() =>
                onSelect(
                  conversation.id
                )
              }
              className={`
                w-full
                text-left
                p-4
                border-b
                hover:bg-gray-50

                ${
                  selectedId ===
                  conversation.id
                    ? "bg-gray-100"
                    : ""
                }
              `}
            >
              <div
                className="
                flex
                items-center
                gap-3
              "
              >
                <img
                  src={avatar}
                  alt={title}
                  className="
                  w-12
                  h-12
                  rounded-full
                "
                />

                <div
                  className="
                  flex-1
                  min-w-0
                "
                >
                  <h3
                    className="
                    font-semibold
                    truncate
                  "
                  >
                    {title}
                  </h3>

                  <p
                    className="
                    text-sm
                    text-gray-500
                    truncate
                  "
                  >
                    {conversation
                      .messages?.[0]
                      ?.content ||
                      "No messages"}
                  </p>

                  {conversation.isGroup && (
                    <p
                      className="
                      text-xs
                      text-blue-500
                    "
                    >
                      Group Chat
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        }
      )}
    </div>
  );
}