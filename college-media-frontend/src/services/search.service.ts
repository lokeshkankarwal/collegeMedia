import { api } from "./api";

export const searchUsers =
  async (
    query: string
  ) => {
    const response =
      await api.get(
        `/users/search?q=${query}`
      );

    return response.data;
  };