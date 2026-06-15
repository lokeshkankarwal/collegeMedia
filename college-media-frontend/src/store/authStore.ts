import { create } from "zustand";

interface AuthState {
  accessToken: string | null;

  setAccessToken: (
    token: string
  ) => void;

  logout: () => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    accessToken:
      localStorage.getItem(
        "accessToken"
      ),

    setAccessToken: (
      token
    ) => {
      localStorage.setItem(
        "accessToken",
        token
      );

      set({
        accessToken: token,
      });
    },

    logout: () => {
      localStorage.removeItem(
        "accessToken"
      );

      set({
        accessToken: null,
      });
    },
  }));