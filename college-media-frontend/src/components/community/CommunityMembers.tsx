interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Props {
  members: Member[];
}

export default function CommunityMembers({
  members,
}: Props) {
  return (
    <div
      className="
      bg-white
      border
      rounded-xl
      p-4
      sm:p-5
      mt-0
      lg:mt-6
      w-full
      min-w-0
    "
    >
      <h2
        className="
        text-xl
        font-bold
        mb-4
      "
      >
        Members
      </h2>

      <div className="space-y-3">
        {members.map(
          (member) => (
            <div
              key={member.id}
              className="
              flex
              items-center
              gap-3
            "
            >
              <img
                src={
                  member.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${member.name}`
                }
                alt={member.name}
                className="
                w-10
                h-10
                rounded-full
                object-cover
                shrink-0
                "
              />

              <span className="truncate min-w-0">
                {member.name}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}