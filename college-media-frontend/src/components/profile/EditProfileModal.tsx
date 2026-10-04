import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { Modal, Button, Avatar, Spinner } from "../common/UI";
import { uploadFile } from "../../services/upload.service";

export interface ProfileUpdateData {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface Props {
  name: string;
  bio?: string;
  avatarUrl?: string;
  onSave: (updates: ProfileUpdateData) => Promise<void>;
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
  
  // Pending file or removal state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialAvatarUrl);
  const [removedPhoto, setRemovedPhoto] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB");
      return;
    }

    // Generate immediate local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setPendingFile(file);
    setRemovedPhoto(false);
    toast.success("Photo selected. Click Save Changes to apply.");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPendingFile(null);
    setPreviewUrl("");
    setRemovedPhoto(true);
    toast.success("Photo removed. Click Save Changes to apply.");
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    const nameChanged = trimmedName !== (initialName || "").trim();
    const bioChanged = trimmedBio !== (initialBio || "").trim();
    const photoChanged = pendingFile !== null || removedPhoto;

    if (nameChanged && !trimmedName) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (!nameChanged && !bioChanged && !photoChanged) {
      toast("No changes to save");
      onClose?.();
      return;
    }

    setSaving(true);
    try {
      const updates: ProfileUpdateData = {};

      if (photoChanged) {
        if (pendingFile) {
          setSaveStatusText("Uploading photo…");
          try {
            const uploadRes = await uploadFile(pendingFile);
            if (!uploadRes?.imageUrl) {
              throw new Error("Did not receive image URL from server");
            }
            updates.avatarUrl = uploadRes.imageUrl;
          } catch (uploadErr: unknown) {
            const uploadMsg =
              uploadErr && typeof uploadErr === "object" && "response" in uploadErr
                ? (uploadErr as { response?: { data?: { message?: string } } }).response?.data?.message
                : "Unable to upload image. Please try again.";
            toast.error(uploadMsg || "Upload failed");
            setSaving(false);
            setSaveStatusText("");
            return;
          }
        } else if (removedPhoto) {
          updates.avatarUrl = null;
        }
      }

      if (nameChanged) {
        updates.name = trimmedName;
      }

      if (bioChanged) {
        updates.bio = trimmedBio;
      }

      setSaveStatusText("Saving profile…");
      await onSave(updates);
      onClose?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : "Unable to update profile.";
      toast.error(msg || "Unable to update profile.");
    } finally {
      setSaving(false);
      setSaveStatusText("");
    }
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="space-y-5">
        {/* Profile Picture Upload Section */}
        <div className="flex flex-col items-center gap-3 py-2 border-b border-slate-100">
          <div className="relative group">
            <div className="relative">
              <Avatar name={name || "User"} src={previewUrl} size="xl" />
              {saving && saveStatusText.includes("Uploading") && (
                <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50 backdrop-blur-xs">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={saving}
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
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              <FiCamera />
              {previewUrl ? "Change Photo" : "Upload Photo"}
            </Button>

            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={handleRemovePhoto}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <FiTrash2 />
                Remove
              </Button>
            )}
          </div>
          {pendingFile && (
            <p className="text-xs text-emerald-600 font-medium">
              New image selected: {pendingFile.name}
            </p>
          )}
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
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-50"
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
            disabled={saving}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell your campus about yourself…"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-50"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" size="md" disabled={saving} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            {saveStatusText || "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
