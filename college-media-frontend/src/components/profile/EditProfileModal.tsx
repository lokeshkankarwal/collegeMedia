import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { Modal, Button, Avatar, Spinner } from "../common/UI";
import { uploadFile } from "../../services/upload.service";

interface Props {
  name: string;
  bio?: string;
  avatarUrl?: string;
  onSave: (name: string, bio: string, avatarUrl?: string) => Promise<void>;
  onClose?: () => void;
}

export default function EditProfileModal({
  name: initialName,
  bio: initialBio = "",
  avatarUrl: initialAvatarUrl,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadFile(file);
      if (res?.imageUrl) {
        setAvatarUrl(res.imageUrl);
        toast.success("Photo uploaded! Click Save to apply changes.");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Unable to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    toast.success("Photo removed. Click Save to apply changes.");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await onSave(name.trim(), bio.trim(), avatarUrl);
      onClose?.();
    } catch {
      toast.error("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="space-y-5">
        {/* Profile Picture Upload Section */}
        <div className="flex flex-col items-center gap-3 py-2 border-b border-slate-100">
          <div className="relative group">
            <div className="relative">
              <Avatar name={name || "User"} src={avatarUrl} size="xl" />
              {uploading && (
                <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50 backdrop-blur-xs">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              title="Change Photo"
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <FiCamera className="text-sm" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={uploading}
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              <FiCamera />
              {avatarUrl ? "Change Photo" : "Upload Photo"}
            </Button>

            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                disabled={uploading || saving}
                onClick={handleRemovePhoto}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <FiTrash2 />
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Name input */}
        <div>
          <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        {/* Bio input */}
        <div>
          <label htmlFor="edit-bio" className="mb-1 block text-sm font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell your campus about yourself…"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" size="md" disabled={saving || uploading} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={saving} disabled={uploading} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
