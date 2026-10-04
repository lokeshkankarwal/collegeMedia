import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiLock, FiCheck } from "react-icons/fi";
import { Button } from "../components/common/UI";
import { resetPassword } from "../services/auth.service";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new link.");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      toast.success(res.message || "Password reset successfully!");
      navigate("/login");
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to reset password. The link may have expired.";
      toast.error(errorMsg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] p-4">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-500 text-3xl font-black text-white shadow-xl shadow-indigo-200">
          C
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">College Media</h1>
        <p className="text-sm text-slate-500">Your campus, connected</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-slate-900">Set New Password</h2>
        <p className="mb-6 text-sm text-slate-500 leading-relaxed">
          Create a strong password for your College Media account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-pass" className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="new-pass"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-pass" className="mb-1 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                id="confirm-pass"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            {password && confirmPassword && (
              <p
                className={`mt-1.5 text-xs flex items-center gap-1 ${
                  password === confirmPassword ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {password === confirmPassword ? (
                  <>
                    <FiCheck /> Passwords match
                  </>
                ) : (
                  "Passwords do not match"
                )}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Reset Password
          </Button>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <FiArrowLeft /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
