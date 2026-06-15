import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import { searchUsers } from "../services/search.service";

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
}

export default function SearchPage() {
  const navigate =
    useNavigate();

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [users, setUsers] =
    useState<User[]>([]);

  const handleSearch =
    async () => {
      try {
        setLoading(true);

        const result =
          await searchUsers(
            query
          );

        setUsers(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        <h1
          className="
          text-3xl
          font-bold
          mb-6
        "
        >
          Explore Users
        </h1>

        <div
          className="
          flex
          gap-3
          mb-8
        "
        >
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            className="
            flex-1
            border
            rounded-lg
            p-3
          "
          />

          <button
            onClick={
              handleSearch
            }
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

        {loading && (
          <div>
            Loading...
          </div>
        )}

        {!loading &&
          users.length ===
            0 && (
            <div
              className="
              text-gray-500
            "
            >
              Search for users
            </div>
          )}

        <div className="space-y-4">

          {users.map(
            (user) => (
              <div
                key={user.id}
                onClick={() =>
                  navigate(
                    `/profile/${user.id}`
                  )
                }
                className="
                border
                rounded-xl
                p-4
                bg-white
                cursor-pointer
                hover:shadow-md
              "
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
                    alt={
                      user.name
                    }
                    className="
                    w-14
                    h-14
                    rounded-full
                  "
                  />

                  <div>
                    <h2
                      className="
                      text-lg
                      font-semibold
                    "
                    >
                      {user.name}
                    </h2>

                    <p
                      className="
                      text-gray-500
                    "
                    >
                      {user.email}
                    </p>

                    {user.bio && (
                      <p
                        className="
                        text-sm
                        mt-1
                      "
                      >
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

        </div>

      </div>
    </MainLayout>
  );
}