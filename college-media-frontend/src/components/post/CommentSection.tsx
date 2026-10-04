import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getComments, addComment } from "../../services/comment.service";
import { Avatar } from "../common/UI";
import { FiSend } from "react-icons/fi";
import type { Comment } from "../../types/comment";

interface Props {
  postId: string;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadComments = useCallback(async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch {
      // silently handle
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleComment = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await addComment(postId, content);
      setContent("");
      await loadComments();
    } catch {
      toast.error("Unable to post comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleComment();
    }
  };

  const userName = localStorage.getItem("userName") || "Me";

  return (
    <div className="space-y-3">
      {/* Existing comments */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2">
          <Avatar name={comment.user?.name || "User"} size="xs" />
          <div className="flex-1 min-w-0 rounded-2xl bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-800">{comment.user?.name}</p>
            <p className="text-sm text-slate-700 break-words">{comment.content}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</p>
          </div>
        </div>
      ))}

      {/* New comment input */}
      <div className="flex items-center gap-2 pt-1">
        <Avatar name={userName} size="xs" />
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment…"
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />
        <button
          type="button"
          onClick={handleComment}
          disabled={!content.trim() || loading}
          aria-label="Post comment"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiSend className="text-xs" />
        </button>
      </div>
    </div>
  );
}
