import {
  useEffect,
  useState,
} from "react";

import MainLayout
from "../layouts/MainLayout";

import CommunityCard
from "../components/community/CommunityCard";

import CreateCommunityModal
from "../components/community/CreateCommunityModal";

import {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
} from "../services/community.service";

export default function
CommunitiesPage() {

  const [
    communities,
    setCommunities,
  ] = useState([]);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const loadCommunities =
    async () => {

      const data =
        await getCommunities();

      setCommunities(data);
    };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleJoin =
    async (
      communityId: string
    ) => {

      const community =
        communities.find(
          (c: any) =>
            c.id ===
            communityId
        );

      if (
        community?.isJoined
      ) {

        await leaveCommunity(
          communityId
        );

      } else {

        await joinCommunity(
          communityId
        );
      }

      loadCommunities();
    };

  const handleCreate =
    async (
      name: string,
      description: string
    ) => {

      await createCommunity(
        name,
        description
      );

      setCreating(
        false
      );

      loadCommunities();
    };

  return (
    <MainLayout>

      <div
        className="
        flex
        flex-col
        sm:flex-row
        justify-between
        items-start
        sm:items-center
        gap-3
        sm:gap-0
        mb-6
      "
      >
        <h1
          className="
          text-2xl
          sm:text-3xl
          font-bold
        "
        >
          Communities
        </h1>

        <button
          onClick={() =>
            setCreating(
              true
            )
          }
          className="
          bg-black
          text-white
          px-4
          py-2
          rounded-lg
          w-full
          sm:w-auto
          shrink-0
        "
        >
          Create
        </button>
      </div>

      {creating && (
        <CreateCommunityModal
          onCreate={
            handleCreate
          }
        />
      )}

      {communities.map(
        (community: any) => (

          <CommunityCard
            key={
              community.id
            }
            community={
              community
            }
            onJoin={
              handleJoin
            }
          />

        )
      )}

    </MainLayout>
  );
}