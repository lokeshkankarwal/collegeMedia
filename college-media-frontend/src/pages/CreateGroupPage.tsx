import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { searchUsers } from "../services/search.service";
import { createGroupConversation } from "../services/conversation.service";

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export default function CreateGroupPage() {
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSearch = async () => {
  try {
    const result = await searchUsers(query);

    const currentUserId =
      localStorage.getItem("userId");

    const filteredUsers =
      result.filter(
        (user: User) =>
          user.id !== currentUserId
      );

    setUsers(filteredUsers);
  } catch (error) {
    console.error(error);
  }
};

  const toggleUser = (user: User) => {
    const exists = selectedUsers.some(
      (u) => u.id === user.id
    );

    if (exists) {
      setSelectedUsers(
        selectedUsers.filter(
          (u) => u.id !== user.id
        )
      );
    } else {
      setSelectedUsers([
        ...selectedUsers,
        user,
      ]);
    }
  };

  const createGroup = async () => {
    try {
      if (!groupName.trim()) {
        alert("Group name is required");
        return;
      }

      if (selectedUsers.length === 0) {
        alert(
          "Please select at least one member"
        );
        return;
      }

      const conversation =
        await createGroupConversation({
          name: groupName,
          participants:
            selectedUsers.map(
              (user) => user.id
            ),
        });

      navigate(
        `/messages?conversation=${conversation.id}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >
          Create Group
        </h1>

        <input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) =>
            setGroupName(e.target.value)
          }
          className="
            border
            rounded-lg
            p-3
            w-full
            mb-4
          "
        />

        <div
          className="
            flex
            gap-3
            mb-6
          "
        >
          <input
            placeholder="Search Users"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className="
              flex-1
              border
              rounded-lg
              p-3
            "
          />

          <button
            onClick={handleSearch}
            className="
              bg-black
              text-white
              px-6
              rounded-lg
            "
          >
            Search
          </button>
        </div>

        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">
              Selected Members (
              {selectedUsers.length})
            </h2>

            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="
                    px-3
                    py-1
                    bg-black
                    text-white
                    rounded-full
                    text-sm
                  "
                >
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => {
            const selected =
              selectedUsers.some(
                (u) =>
                  u.id === user.id
              );

            return (
              <div
                key={user.id}
                onClick={() =>
                  toggleUser(user)
                }
                className={`
                  border
                  rounded-xl
                  p-4
                  cursor-pointer
                  transition-colors
                  ${
                    selected
                      ? "bg-gray-100"
                      : "bg-white"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    alt={user.name}
                    className="
                      w-12
                      h-12
                      rounded-full
                    "
                  />

                  <h2>{user.name}</h2>

                  <div className="ml-auto text-xl">
                    {selected
                      ? "✓"
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={createGroup}
          disabled={
            !groupName.trim() ||
            selectedUsers.length === 0
          }
          className="
            mt-8
            w-full
            bg-black
            text-white
            p-4
            rounded-xl
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          Create Group
        </button>
      </div>
    </MainLayout>
  );
}