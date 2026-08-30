import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, LoaderCircle, KeyRound } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card rounded-2xl p-9 max-w-md w-full">
        <div className="w-11 h-11 rounded-lg bg-signal/10 text-signal flex items-center justify-center mb-4">
          <KeyRound size={21} />
        </div>
        <h2 className="font-display text-xl text-ink mb-1">Forgot your password?</h2>
        <p className="text-ink-muted text-sm mb-6">
          {sent
            ? "Check your inbox for a reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {!sent && (
          <form onSubmit={onSubmit}>
            <label className="text-xs text-ink-muted block mb-1.5">Email address</label>
            <div className="flex items-center gap-2.5 bg-base-800 border border-base-700 rounded-lg px-3 focus-within:border-signal transition">
              <Mail size={17} className="text-ink-muted flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none py-2.5 text-sm text-ink placeholder:text-ink-muted"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 btn-signal text-white rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} /> Sending...
                </>
              ) : (
                <>
                  Send reset link <ArrowUpRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink-muted mt-5">
          <Link to="/login" className="text-signal hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;