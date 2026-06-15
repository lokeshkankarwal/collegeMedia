import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const login = async () => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // localStorage.setItem("accessToken", response.data.accessToken);

      setAccessToken(response.data.accessToken);

      localStorage.setItem("userId", response.data.user.id);

      localStorage.setItem("userName", response.data.user.name);
      alert("Login Success");

      console.log(
  "Store token:",
  useAuthStore.getState().accessToken
);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-96 border rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <button
          onClick={login}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
        <Link to="/register" className="text-blue-500 hover:underline">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
}
