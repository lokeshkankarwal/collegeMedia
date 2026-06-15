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
    <div className="mt-4">

      <div className="flex gap-2">

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
          rounded
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