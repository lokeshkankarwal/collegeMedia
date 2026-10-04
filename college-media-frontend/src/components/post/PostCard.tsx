import { useState } from "react";
import { FiHeart, FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { Avatar } from "../common/UI";
import CommentSection from "./CommentSection";
import type { Post } from "../../types/post";

interface Props {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function PostCard({ post, currentUserId, onLike, onDelete }: Props) {
  const [showComments, setShowComments] = useState(false);

  const isLiked =
    post.likes?.some((like) => like.userId === currentUserId) || false;
  const isOwner = post.author.id === currentUserId;

  return (
    <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md animate-float-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={post.author.name} src={post.author.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{post.author.name}</p>
            <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            aria-label="Delete post"
            onClick={() => onDelete(post.id)}
            className="shrink-0 grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
          >
            <FiTrash2 />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="mt-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap break-words">
          {post.content}
        </p>
      )}

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post media"
          className="mt-4 w-full rounded-2xl object-cover max-h-[400px] border border-slate-100"
          loading="lazy"
        />
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          aria-label={isLiked ? "Unlike" : "Like"}
          className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
            isLiked
              ? "bg-rose-50 text-rose-500"
              : "text-slate-500 hover:bg-rose-50 hover:text-rose-500"
          }`}
        >
          <FiHeart
            className={`text-base transition-transform group-hover:scale-110 ${isLiked ? "fill-rose-500" : ""}`}
          />
          <span>{post.likesCount ?? 0}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
        >
          <FiMessageSquare className="text-base" />
          <span>{post.commentsCount ?? 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}
