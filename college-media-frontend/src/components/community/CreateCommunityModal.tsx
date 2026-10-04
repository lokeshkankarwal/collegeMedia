import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Button } from "../common/UI";

interface Props {
  onCreate: (name: string, description: string) => void;
  onClose?: () => void;
}

export default function CreateCommunityModal({ onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) { toast.error("Please enter a community name."); return; }
    onCreate(name, description);
  };

  return (
    <Modal title="Create Community" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="comm-name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            id="comm-name"
            type="text"
            placeholder="e.g. Computer Science Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div>
          <label htmlFor="comm-desc" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="comm-desc"
            placeholder="What is this community about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleCreate}>Create</Button>
        </div>
      </div>
    </Modal>
  );
}
