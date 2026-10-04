import { io } from "socket.io-client";

const getToken = () => localStorage.getItem("accessToken");

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
  // Keep Socket.IO's standard WebSocket-capable transport negotiation.
  // It falls back safely when an upgrade is temporarily unavailable.
});

export const connectSocket = () => {
  // Read the current token immediately before the handshake. The previous
  // implementation captured a null/stale token when this module first loaded.
  const token = getToken();
  socket.auth = { token };
  socket.connect();
};
