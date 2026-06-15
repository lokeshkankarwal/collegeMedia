import { io } from "socket.io-client";

const getToken = () => localStorage.getItem("accessToken");

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});

// Update token in socket auth when it changes
socket.on("connect", () => {
  const token = getToken();
  (socket.auth as any).token = token;
});