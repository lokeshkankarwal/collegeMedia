import { useRef, useState } from "react";
import { Avatar } from "../common/UI";
import { FiImage, FiSend, FiX } from "react-icons/fi";

interface Props {
  onSubmit: (content: string, image?: File) => Promise<void> | void;
}

export default function CreatePost({ onSubmit }: Props) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const userName = localStorage.getItem("userName") || "Me";

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      await onSubmit(content, image || undefined);
      setContent("");
      removeImage();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm animate-float-in">
      <div className="flex gap-3">
        <Avatar name={userName} size="md" />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />

          {preview && (
            <div className="relative mt-2 inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-2xl object-cover border border-slate-200"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Attach image"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <FiImage className="text-base" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && !image)}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Posting…
                </span>
              ) : (
                <>
                  <FiSend />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
