import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import MainLayout from "../layouts/MainLayout";
import { Avatar, Button, EmptyState, ErrorState, PageHeader, UserCardSkeleton } from "../components/common/UI";
import { getUserFollowing, getUser } from "../services/user.service";
import { followUser, unfollowUser } from "../services/follow.service";
import type { User } from "../types/user";

export default function FollowingPage() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "";
  const targetUserId = paramUserId || currentUserId;

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(false);
    try {
      const [userData, followingData] = await Promise.all([
        getUser(targetUserId),
        getUserFollowing(targetUserId),
      ]);
      setTargetUser(userData);
      setFollowing(followingData || []);
    } catch {
      setError(true);
      toast.error("Unable to load following list");
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleFollow = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setActionLoadingId(user.id);
    try {
      if (user.isFollowing) {
        await unfollowUser(user.id);
        toast.success(`Unfollowed ${user.name}`);
      } else {
        await followUser(user.id);
        toast.success(`Following ${user.name}`);
      }
      setFollowing((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isFollowing: !u.isFollowing,
                followersCount: u.isFollowing
                  ? Math.max(0, (u.followersCount || 1) - 1)
                  : (u.followersCount || 0) + 1,
              }
            : u
        )
      );
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isMe = targetUserId === currentUserId;
  const pageTitle = isMe ? "People You Follow" : `People ${targetUser?.name || "User"} Follows`;

  return (
    <MainLayout>
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <FiArrowLeft />
          Back
        </button>
      </div>

      <PageHeader
        eyebrow="Network"
        title={pageTitle}
      />

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <UserCardSkeleton key={n} />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorState
          message="Unable to load following list. Please try again."
          onRetry={loadData}
        />
      )}

      {!loading && !error && following.length === 0 && (
        <EmptyState
          title="Not following anyone yet"
          description={
            isMe
              ? "Discover classmates and peers through the search page to see their updates here."
              : "This user is not following anyone yet."
          }
          icon={<FiUsers />}
          action={
            isMe ? (
              <Button variant="primary" size="sm" onClick={() => navigate("/search")}>
                Explore users
              </Button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && following.length > 0 && (
        <div className="space-y-3">
          {following.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <div
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={user.name} src={user.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                      {user.name}
                    </p>
                    {user.bio ? (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.bio}</p>
                    ) : (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    )}
                    {(user.branch || user.year) && (
                      <p className="text-[11px] text-indigo-600 mt-0.5">
                        {[user.branch, user.year ? `Year ${user.year}` : null]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                </div>

                {!isSelf && (
                  <Button
                    variant={user.isFollowing ? "secondary" : "primary"}
                    size="sm"
                    loading={actionLoadingId === user.id}
                    onClick={(e) => handleToggleFollow(e, user)}
                    className="shrink-0"
                  >
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
