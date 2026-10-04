import { useNavigate } from "react-router-dom";
import { FiUsers, FiArrowRight } from "react-icons/fi";
import { Button } from "../common/UI";
import type { Community } from "../../types/community";

interface Props {
  community: Community;
  onJoin: (communityId: string) => void;
}

export default function CommunityCard({ community, onJoin }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/communities/${community.id}`)}
      className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <FiUsers className="text-lg" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate">{community.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <FiUsers className="text-xs" />
              {community.membersCount ?? 0} members
            </p>
          </div>
        </div>

        <Button
          variant={community.isJoined ? "secondary" : "primary"}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onJoin(community.id); }}
          className="shrink-0"
        >
          {community.isJoined ? "Joined ✓" : "Join"}
        </Button>
      </div>

      {/* Description */}
      {community.description && (
        <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-6">
          {community.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end gap-1 text-xs font-medium text-indigo-600">
        <span>Open community</span>
        <FiArrowRight />
      </div>
    </div>
  );
}
