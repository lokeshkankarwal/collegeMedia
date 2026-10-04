import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { searchUsers } from "../services/search.service";
import { Avatar, EmptyState, PageHeader, UserCardSkeleton } from "../components/common/UI";
import { FiSearch } from "react-icons/fi";

interface SearchUser {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setUsers([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const result = await searchUsers(query);
        setUsers(result);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <MainLayout>
      <PageHeader eyebrow="Discover" title="Search Users" />

      {/* Search input */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        <input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 shadow-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => <UserCardSkeleton key={n} />)}
        </div>
      )}

      {/* Empty / no-results */}
      {!loading && !searched && (
        <EmptyState
          title="Find your classmates"
          description="Start typing a name to search for users on College Media."
          icon={<FiSearch />}
        />
      )}

      {!loading && searched && users.length === 0 && (
        <EmptyState
          title="No users found"
          description={`We couldn't find anyone matching "${query}". Try a different name.`}
        />
      )}

      {/* Results */}
      {!loading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => navigate(`/profile/${user.id}`)}
              className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <Avatar name={user.name} src={user.avatarUrl} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                {user.bio && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">{user.bio}</p>
                )}
              </div>
              {user.followersCount !== undefined && (
                <span className="shrink-0 text-xs text-slate-400">
                  {user.followersCount} followers
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
