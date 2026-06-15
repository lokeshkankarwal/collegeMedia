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
    <div className="border rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 w-full min-w-0">
      <textarea
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        placeholder="What's happening?"
        className="
          w-full
          min-w-0
          border
          rounded-lg
          p-3
          mb-3
          min-h-[80px]
          resize-y
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
    w-full
    max-w-full
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
          w-full
          sm:w-auto
          min-h-[44px]
        "
      >
        Post
      </button>
    </div>
  );
}