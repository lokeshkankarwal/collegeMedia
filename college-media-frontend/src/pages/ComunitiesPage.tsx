import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import CommunityCard from "../components/community/CommunityCard";
import CreateCommunityModal from "../components/community/CreateCommunityModal";
import { getCommunities, createCommunity, joinCommunity, leaveCommunity } from "../services/community.service";
import { Button, CardSkeleton, EmptyState, PageHeader } from "../components/common/UI";
import type { Community } from "../types/community";
import { FiUsers } from "react-icons/fi";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch {
      toast.error("Unable to load communities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCommunities(); }, [loadCommunities]);

  const handleJoin = async (communityId: string) => {
    const community = communities.find((c) => c.id === communityId);
    try {
      if (community?.isJoined) {
        await leaveCommunity(communityId);
        toast.success("Left community.");
      } else {
        await joinCommunity(communityId);
        toast.success("Joined community!");
      }
      loadCommunities();
    } catch {
      toast.error("Unable to update membership.");
    }
  };

  const handleCreate = async (name: string, description: string) => {
    try {
      await createCommunity(name, description);
      setCreating(false);
      loadCommunities();
      toast.success("Community created!");
    } catch {
      toast.error("Unable to create community.");
    }
  };

  return (
    <MainLayout>
      <PageHeader
        eyebrow="Campus"
        title="Communities"
        action={
          <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
            <FiUsers />
            Create
          </Button>
        }
      />

      {creating && (
        <CreateCommunityModal onCreate={handleCreate} onClose={() => setCreating(false)} />
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => <CardSkeleton key={n} rows={2} />)}
        </div>
      )}

      {!loading && communities.length === 0 && (
        <EmptyState
          title="No communities yet"
          description="Create the first campus community and invite your classmates."
          icon={<FiUsers />}
          action={
            <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
              Create Community
            </Button>
          }
        />
      )}

      {!loading && communities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {communities.map((community: Community) => (
            <CommunityCard key={community.id} community={community} onJoin={handleJoin} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
