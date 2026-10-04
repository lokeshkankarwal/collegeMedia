import { create } from "zustand";
import { disconnectSocket } from "../services/socket";

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
      disconnectSocket();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");

      set({
        accessToken: null,
      });
    },
  }));
