import { useState } from "react";

interface Props {
  onSubmit: (
    content: string,
    image?: File
  ) => void;
}

export default function CreatePost({
  onSubmit,
}: Props) {
  const [content, setContent] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);

  return (
    <div className="border rounded-xl p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        placeholder="What's happening?"
        className="
          w-full
          border
          rounded-lg
          p-3
          mb-3
        "
      />

      <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setImage(
      e.target.files?.[0] || null
    )
  }
  className="
    mb-3
    cursor-pointer

    file:mr-4
    file:px-4
    file:py-2
    file:rounded-lg
    file:border-0

    file:bg-black
    file:text-white

    file:cursor-pointer
    file:hover:bg-gray-800

    hover:text-white
  "
/>

      <button
        onClick={() => {
          onSubmit(
            content,
            image || undefined
          );

          setContent("");
          setImage(null);
        }}
        className="
          bg-black
          text-white
          px-6
          py-2
          rounded-lg
        "
      >
        Post
      </button>
    </div>
  );
}