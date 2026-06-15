import { api }
from "./api";

export const createGroup =
async (
  name: string,
  members: string[]
) => {

  const response =
    await api.post(
      "/conversations/groups",
      {
        name,
        members,
      }
    );

  return response.data;
};