import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/common/UI";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const login = async () => {
    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("userName", response.data.user.name);
      setAccessToken(response.data.accessToken);
      navigate("/");
    } catch (error: unknown) {
      const msg =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Invalid email or password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 text-3xl font-black text-white shadow-xl shadow-indigo-200">
          C
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">College Media</h1>
        <p className="text-sm text-slate-500">Your campus, connected</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Sign in</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={login}
            className="w-full"
          >
            Sign in
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
