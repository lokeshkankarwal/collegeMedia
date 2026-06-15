import {
  useState,
} from "react";

interface Props {
  name: string;

  bio: string;

  onSave: (
    name: string,
    bio: string
  ) => void;
}

export default function
EditProfileModal({
  name: initialName,
  bio: initialBio,
  onSave,
}: Props) {

  const [name, setName] =
    useState(
      initialName
    );

  const [bio, setBio] =
    useState(
      initialBio
    );

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
    "
    >
      <div
        className="
        bg-white
        p-6
        rounded-xl
        w-96
      "
      >
        <h2
          className="
          text-xl
          font-bold
          mb-4
        "
        >
          Edit Profile
        </h2>

        <input
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          className="
          border
          p-2
          w-full
          mb-3
        "
        />

        <textarea
          value={bio}
          onChange={(e) =>
            setBio(
              e.target.value
            )
          }
          className="
          border
          p-2
          w-full
        "
        />

        <button
          onClick={() =>
            onSave(
              name,
              bio
            )
          }
          className="
          mt-4
          bg-black
          text-white
          px-4
          py-2
          rounded
        "
        >
          Save
        </button>
      </div>
    </div>
  );
}