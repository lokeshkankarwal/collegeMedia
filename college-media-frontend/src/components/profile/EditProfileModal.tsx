import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button } from "../common/UI";

interface Props {
  name: string;
  bio?: string;
  onSave: (name: string, bio: string) => Promise<void>;
  onClose?: () => void;
}

export default function EditProfileModal({ name: initialName, bio: initialBio = "", onSave, onClose }: Props) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty."); return; }
    setLoading(true);
    try {
      await onSave(name, bio);
      onClose?.();
    } catch {
      toast.error("Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div>
          <label htmlFor="edit-bio" className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell your campus about yourself…"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
