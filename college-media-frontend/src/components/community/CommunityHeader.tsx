import { FiUsers, FiTrash2, FiGlobe } from "react-icons/fi";
import { Button } from "../common/UI";
import type { Community } from "../../types/community";

interface Props {
  community: Community;
  onJoin?: () => void;
  onDelete?: () => void;
  joinLoading?: boolean;
}

export default function CommunityHeader({
  community,
  onJoin,
  onDelete,
  joinLoading = false,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 mb-6 shadow-sm animate-float-in">
      {/* Banner */}
      <div className="h-32 sm:h-40 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 mb-6 relative overflow-hidden flex items-end p-4">
        <div className="flex items-center gap-2 rounded-xl bg-black/30 backdrop-blur-md px-3 py-1 text-white text-xs font-semibold">
          <FiGlobe />
          <span>Campus Community</span>
        </div>
      </div>

      {/* Header content */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
              {community.name}
            </h1>
            {community.isOwner && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                Creator
              </span>
            )}
          </div>

          {community.description && (
            <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-2xl break-words">
              {community.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <FiUsers className="text-indigo-500" />
              {community.membersCount ?? 0} {community.membersCount === 1 ? "Member" : "Members"}
            </span>
            {community.owner?.name && (
              <span>Created by {community.owner.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {community.isOwner && onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              className="gap-1.5 text-xs"
            >
              <FiTrash2 />
              Delete Community
            </Button>
          )}

          {onJoin && (
            <Button
              variant={community.isJoined ? "secondary" : "primary"}
              size="md"
              loading={joinLoading}
              onClick={onJoin}
              className="w-full sm:w-auto"
            >
              {community.isJoined ? "Leave Community" : "Join Community"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
