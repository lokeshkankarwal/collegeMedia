import { useNavigate } from "react-router-dom";
import { FiUsers, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { Button } from "../common/UI";
import type { Community } from "../../types/community";

interface Props {
  community: Community;
  onJoin: (communityId: string) => void;
  onDelete?: (community: Community) => void;
  actionLoading?: boolean;
}

export default function CommunityCard({
  community,
  onJoin,
  onDelete,
  actionLoading = false,
}: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/communities/${community.id}`)}
      className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md relative flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-100">
              <FiUsers className="text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 truncate text-base">{community.name}</h2>
                {community.isOwner && (
                  <span className="shrink-0 rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <FiUsers className="text-xs" />
                {community.membersCount ?? 0} {community.membersCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {community.isOwner && onDelete && (
              <button
                type="button"
                title="Delete Community"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(community);
                }}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}

            <Button
              variant={community.isJoined ? "secondary" : "primary"}
              size="sm"
              loading={actionLoading}
              onClick={(e) => {
                e.stopPropagation();
                onJoin(community.id);
              }}
              className="text-xs"
            >
              {community.isJoined ? "Leave" : "Join"}
            </Button>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>{community.postsCount !== undefined ? `${community.postsCount} posts` : "Campus Group"}</span>
        <span className="inline-flex items-center gap-1 text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          Open community <FiArrowRight />
        </span>
      </div>
    </div>
  );
}
