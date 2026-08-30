import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LockKeyhole, Eye, EyeOff, ArrowUpRight, LoaderCircle, KeyRound } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
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
        <h2 className="font-display text-xl text-ink mb-1">Set a new password</h2>
        <p className="text-ink-muted text-sm mb-6">Choose a strong password for your account.</p>

        <form onSubmit={onSubmit}>
          <label className="text-xs text-ink-muted block mb-1.5">New password</label>
          <div className="flex items-center gap-2.5 bg-base-800 border border-base-700 rounded-lg px-3 focus-within:border-signal transition">
            <LockKeyhole size={17} className="text-ink-muted flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none py-2.5 text-sm text-ink placeholder:text-ink-muted"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink-muted flex-shrink-0">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 btn-signal text-white rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin" size={17} /> Resetting...
              </>
            ) : (
              <>
                Reset password <ArrowUpRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-5">
          <Link to="/login" className="text-signal hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;