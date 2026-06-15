import type { Message } from "../../types/message";

interface Props {
  message: Message;
  currentUserId: string;
}

export default function MessageBubble({
  message,
  currentUserId,
}: Props) {
  const isMine =
    message.senderId === currentUserId;

  return (
    <div
      className={`flex ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`
        max-w-[85%]
        sm:max-w-md
        px-3
        sm:px-4
        py-2
        sm:py-3
        rounded-2xl
        shadow-sm
        break-words

        ${
          isMine
            ? "bg-black text-white"
            : "bg-gray-200 text-black"
        }
      `}
      >
        {/* Image */}

        {message.attachmentUrl &&
          message.attachmentType ===
            "IMAGE" && (
            <img
              src={
                message.attachmentUrl
              }
              alt="attachment"
              className="
              rounded-xl
              mb-2
              w-full
              max-w-full
              sm:max-w-xs
              object-cover
            "
            />
          )}

        {/* PDF */}

        {message.attachmentUrl &&
          message.attachmentType ===
            "PDF" && (
            <a
              href={
                message.attachmentUrl
              }
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              📄 Open PDF
            </a>
          )}

        {/* Text */}

        {message.content && (
          <p>
            {message.content}
          </p>
        )}

        <p
          className={`
          text-xs
          mt-2

          ${
            isMine
              ? "text-gray-300"
              : "text-gray-500"
          }
        `}
        >
          {new Date(
            message.createdAt
          ).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}