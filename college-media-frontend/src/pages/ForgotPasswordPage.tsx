import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail, FiCheckCircle } from "react-icons/fi";
import { Button } from "../components/common/UI";
import { forgotPassword } from "../services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid university email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success(res.message || "Reset link sent!");
    } catch {
      toast.error("Failed to request password reset. Please try again.");
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
        <h2 className="mb-2 text-xl font-bold text-slate-900">Forgot Password</h2>
        <p className="mb-6 text-sm text-slate-500 leading-relaxed">
          Enter your registered email and we'll send you instructions to reset your password.
        </p>

        {submitted ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <FiCheckCircle className="text-xl text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-5">
                <p className="font-semibold text-sm mb-1 text-emerald-950">Check your inbox</p>
                If an account exists with this email, a password reset link has been sent. The link expires in 15 minutes.
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Didn't receive an email? Check your spam folder or try again in a few minutes.
            </p>
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
              >
                <FiArrowLeft /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Send Reset Link
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
        )}
      </div>
    </div>
  );
}
