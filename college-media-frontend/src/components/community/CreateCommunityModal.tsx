import {
  useState,
} from "react";

interface Props {
  onCreate: (
    name: string,
    description: string
  ) => void;
}

export default function
CreateCommunityModal({
  onCreate,
}: Props) {

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

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
          Create Community
        </h2>

        <input
          placeholder="Name"
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
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
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
            onCreate(
              name,
              description
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
          Create
        </button>
      </div>
    </div>
  );
}