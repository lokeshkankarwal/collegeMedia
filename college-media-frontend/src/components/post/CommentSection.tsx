import {
  useEffect,
  useState,
} from "react";

import {
  getComments,
  addComment,
} from "../../services/comment.service";

import type {
  Comment,
} from "../../types/comment";

interface Props {
  postId: string;
}

export default function CommentSection({
  postId,
}: Props) {

  const [comments,
    setComments] =
    useState<Comment[]>([]);

  const [content,
    setContent] =
    useState("");

  const loadComments =
    async () => {
      try {

        const data =
          await getComments(
            postId
          );

        setComments(data);

      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadComments();
  }, []);

  const handleComment =
    async () => {

      if (!content.trim())
        return;

      await addComment(
        postId,
        content
      );

      setContent("");

      loadComments();
    };

  return (
    <div className="mt-4 min-w-0">

      {/* Comment input — stacks on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row gap-2">

        <input
          value={content}
          onChange={(e) =>
            setContent(
              e.target.value
            )
          }
          placeholder="Write a comment..."
          className="
          border
          rounded
          p-2
          flex-1
          w-full
          min-w-0
          min-h-[44px]
        "
        />

        <button
          onClick={
            handleComment
          }
          className="
          bg-black
          text-white
          px-4
          py-2
          rounded
          w-full
          sm:w-auto
          shrink-0
          min-h-[44px]
        "
        >
          Post
        </button>

      </div>

      <div className="mt-4">

        {comments.map(
          (comment) => (

            <div
              key={
                comment.id
              }
              className="
              border-b
              py-3
            "
            >
              <h4
                className="
                font-semibold
              "
              >
                {
                  comment.user
                    .name
                }
              </h4>

              <p>
                {
                  comment.content
                }
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}