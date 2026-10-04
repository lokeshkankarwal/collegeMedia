import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import { Avatar, Button, EmptyState, PageHeader, UserCardSkeleton } from "../components/common/UI";
import { searchUsers } from "../services/search.service";
import { createGroupConversation } from "../services/conversation.service";
import { FiSearch, FiUsers, FiX } from "react-icons/fi";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = localStorage.getItem("userId") || "";

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setUsers([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearched(true);
      try {
        const result = await searchUsers(query);
        setUsers(result.filter((u: User) => u.id !== currentUserId));
      } catch {
        setUsers([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, currentUserId]);

  const toggleUser = (user: User) => {
    const exists = selectedUsers.some((u) => u.id === user.id);
    setSelectedUsers(exists
      ? selectedUsers.filter((u) => u.id !== user.id)
      : [...selectedUsers, user]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim()) { toast.error("Please enter a group name."); return; }
    if (selectedUsers.length === 0) { toast.error("Please select at least one member."); return; }
    setCreating(true);
    try {
      const conversation = await createGroupConversation({
        name: groupName,
        participants: selectedUsers.map((u) => u.id),
      });
      toast.success("Group created!");
      navigate(`/messages?conversation=${conversation.id}`);
    } catch {
      toast.error("Unable to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader eyebrow="Messages" title="Create Group" />

      {/* Group Name */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-slate-700">Group name</label>
        <input
          type="text"
          placeholder="e.g. CS 2025 Study Group"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Selected Members */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 rounded-3xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">
            Selected members ({selectedUsers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 rounded-2xl bg-white border border-indigo-200 px-3 py-1.5 shadow-sm"
              >
                <Avatar name={user.name} src={user.avatarUrl} size="xs" />
                <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${user.name}`}
                  onClick={() => toggleUser(user)}
                  className="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition"
                >
                  <FiX className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Users */}
      <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">Add members</label>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        <div className="mt-3 space-y-2">
          {searchLoading && [1, 2].map((n) => <UserCardSkeleton key={n} />)}

          {!searchLoading && searched && users.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">No users found.</p>
          )}

          {!searchLoading && !searched && (
            <EmptyState
              title="Search for members"
              description="Type a name to find people to add to your group."
              icon={<FiUsers />}
            />
          )}

          {!searchLoading && users.map((user) => {
            const selected = selectedUsers.some((u) => u.id === user.id);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <span className="flex-1 font-semibold text-slate-800 text-sm truncate">{user.name}</span>
                <span className={`text-xs font-bold ${selected ? "text-indigo-600" : "text-slate-300"}`}>
                  {selected ? "✓ Added" : "+ Add"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={createGroup}
        loading={creating}
        disabled={!groupName.trim() || selectedUsers.length === 0}
        className="w-full"
      >
        {creating ? "Creating…" : "Create Group"}
      </Button>
    </MainLayout>
  );
}
