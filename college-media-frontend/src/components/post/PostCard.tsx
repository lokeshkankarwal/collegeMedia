import { useState } from "react";
import CommentSection from "./CommentSection";
import type { Post } from "../../types/post";

interface Props {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
}: Props) {
  const [showComments, setShowComments] =
    useState(false);

  const isLiked =
    post.likes?.some(
      (like) =>
        like.userId === currentUserId
    ) || false;

  return (
    <div
      className="
        bg-white
        border
        rounded-xl
        p-3
        sm:p-4
        mb-4
        shadow-sm
        w-full
        min-w-0
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <img
            src={
              post.author.avatarUrl ||
              `https://ui-avatars.com/api/?name=${post.author.name}`
            }
            alt={post.author.name}
            className="
              w-10
              h-10
              rounded-full
              object-cover
            "
          />

          <div className="min-w-0 text-left">
            <h3 className="font-semibold truncate">
              {post.author.name}
            </h3>

            <p className="text-xs text-gray-500">
              {new Date(
                post.createdAt
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {post.author.id === currentUserId && (
  <button
    onClick={() => onDelete(post.id)}
    className="text-red-500 hover:text-red-700 shrink-0 text-sm sm:text-base"
  >
    Delete
  </button>
)}
      </div>

      {/* Content */}
      <div className="mt-4 text-left">
        <p className="whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="
            mt-4
            rounded-xl
            w-full
            max-h-[300px]
            sm:max-h-[400px]
            md:max-h-[500px]
            object-cover
          "
        />
      )}

      {/* Actions */}
      <div
        className="
          mt-4
          border-t
          pt-4
        "
      >
        <div className="flex gap-6">
          <button
            onClick={() =>
              onLike(post.id)
            }
            className="
              flex
              items-center
              gap-2
              hover:scale-105
              transition-transform
            "
          >
            <span className="text-xl">
              {isLiked ? "❤️" : "🤍"}
            </span>

            <span>
              {post.likesCount ?? 0}
            </span>
          </button>

          <button
            onClick={() =>
              setShowComments(
                !showComments
              )
            }
            className="
              flex
              items-center
              gap-2
              hover:text-blue-500
              transition-colors
            "
          >
            <span className="text-xl">
              💬
            </span>

            <span>
              {post.commentsCount ?? 0}
            </span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4">
            <CommentSection
              postId={post.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}