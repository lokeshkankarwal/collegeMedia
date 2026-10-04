import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import CommunityCard from "../components/community/CommunityCard";
import CreateCommunityModal from "../components/community/CreateCommunityModal";
import {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
} from "../services/community.service";
import { Button, CardSkeleton, ConfirmDialog, EmptyState, PageHeader } from "../components/common/UI";
import type { Community } from "../types/community";
import { FiPlus, FiUsers } from "react-icons/fi";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "joined">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Deletion state
  const [deletingCommunity, setDeletingCommunity] = useState<Community | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommunities();
      setCommunities(data || []);
    } catch {
      toast.error("Unable to load communities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const handleJoin = async (communityId: string) => {
    const community = communities.find((c) => c.id === communityId);
    setActionLoadingId(communityId);
    try {
      if (community?.isJoined) {
        await leaveCommunity(communityId);
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  isJoined: false,
                  membersCount: Math.max(0, (c.membersCount || 1) - 1),
                }
              : c
          )
        );
        toast.success(`Left ${community.name}`);
      } else {
        await joinCommunity(communityId);
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  isJoined: true,
                  membersCount: (c.membersCount || 0) + 1,
                }
              : c
          )
        );
        toast.success(`Joined ${community?.name || "community"}!`);
      }
    } catch {
      toast.error("Unable to update membership.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreate = async (name: string, description: string) => {
    try {
      const newCommunity = await createCommunity(name, description);
      setCreating(false);
      setCommunities((prev) => [newCommunity, ...prev]);
      toast.success("Community created!");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Unable to create community.";
      toast.error(msg || "Unable to create community.");
    }
  };

  const confirmDelete = async () => {
    if (!deletingCommunity) return;
    setDeleteLoading(true);
    try {
      await deleteCommunity(deletingCommunity.id);
      setCommunities((prev) => prev.filter((c) => c.id !== deletingCommunity.id));
      toast.success(`Deleted community "${deletingCommunity.name}"`);
      setDeletingCommunity(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Unable to delete community.";
      toast.error(msg || "Failed to delete community");
    } finally {
      setDeleteLoading(false);
    }
  };

  const joinedCommunities = communities.filter((c) => c.isJoined);
  const displayedCommunities = activeTab === "joined" ? joinedCommunities : communities;

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Campus Hub"
        title="Communities"
        action={
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <FiPlus />
            Create Community
          </Button>
        }
      />

      {/* Tabs: All Communities vs My Joined Communities */}
      <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Communities ({communities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("joined")}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "joined"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          My Joined Communities ({joinedCommunities.length})
        </button>
      </div>

      {creating && (
        <CreateCommunityModal
          onCreate={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <CardSkeleton key={n} rows={2} />
          ))}
        </div>
      )}

      {!loading && displayedCommunities.length === 0 && (
        <EmptyState
          title={
            activeTab === "joined"
              ? "You haven't joined any communities yet"
              : "No communities found"
          }
          description={
            activeTab === "joined"
              ? "Browse all communities above to find clubs and study groups that interest you."
              : "Be the first to create a campus community and invite your classmates."
          }
          icon={<FiUsers />}
          action={
            activeTab === "joined" ? (
              <Button variant="primary" size="sm" onClick={() => setActiveTab("all")}>
                Explore All Communities
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
                Create First Community
              </Button>
            )
          }
        />
      )}

      {!loading && displayedCommunities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {displayedCommunities.map((community: Community) => (
            <CommunityCard
              key={community.id}
              community={community}
              actionLoading={actionLoadingId === community.id}
              onJoin={handleJoin}
              onDelete={(c) => setDeletingCommunity(c)}
            />
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Community Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingCommunity)}
        title="Delete this community?"
        description={`Are you sure you want to delete "${deletingCommunity?.name}"? This action cannot be undone and will remove all community discussions.`}
        confirmText="Delete Community"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onClose={() => setDeletingCommunity(null)}
      />
    </MainLayout>
  );
}
