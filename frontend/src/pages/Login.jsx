import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowUpRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { setCredentials } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleResend = async () => {
    try {
      setResending(true);
      await axiosInstance.post("/auth/resend-verification", { email });
      toast.success("Verification email resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  async function onSubmit(event) {
    event.preventDefault();
    setFieldError("");
    setNeedsVerification(false);

    if (!email.trim()) return setFieldError("Email is required");
    if (!password) return setFieldError("Password is required");

    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/login", { email, password });
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
      if (message.toLowerCase().includes("verify")) setNeedsVerification(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col p-6">
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="flex items-center gap-2 z-10">
        <span className="w-7 h-7 rounded-md bg-signal text-white flex items-center justify-center">
          <Sparkles size={16} strokeWidth={2.5} />
        </span>
        <span className="font-display font-semibold text-sm text-ink">MockAI</span>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto py-16 z-10 w-full items-center">
        {/* Intro panel — hidden on mobile */}
        <section className="hidden md:block">
          <p className="flex items-center gap-2 text-xs font-mono-data text-ink-muted mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal" />
            The clear path forward
          </p>

          <h1 className="font-display text-4xl leading-[1.15] text-ink mb-4">
            Rehearse before
            <br />
            <span className="text-signal">it counts.</span>
          </h1>

          <p className="text-ink-muted text-[15px] leading-relaxed max-w-sm mb-8">
            Voice-driven mock interviews with a real interviewer persona — scored on delivery,
            not just answers.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <span className="w-6.5 h-6.5 w-7 h-7 rounded-md bg-base-900 border border-base-700 flex items-center justify-center text-signal flex-shrink-0">
                <Check size={15} />
              </span>
              Company-specific interview styles
            </div>
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <span className="w-7 h-7 rounded-md bg-base-900 border border-base-700 flex items-center justify-center text-signal flex-shrink-0">
                <ShieldCheck size={15} />
              </span>
              Real proctoring, real pressure
            </div>
          </div>

          <div className="card rounded-xl p-4 max-w-xs">
            <p className="text-sm text-ink italic mb-2">
              "Practicing here made the real interview feel familiar."
            </p>
            <span className="text-xs text-ink-muted">— Early user</span>
          </div>
        </section>

        {/* Form card */}
        <section className="card rounded-2xl p-9 max-w-md w-full mx-auto">
          <div className="flex items-center gap-3.5 mb-1.5">
            <div className="w-11 h-11 rounded-lg bg-signal/10 text-signal flex items-center justify-center flex-shrink-0">
              <KeyRound size={21} />
            </div>
            <div>
              <p className="text-xs font-mono-data text-ink-muted">Your workspace</p>
              <h2 className="font-display text-xl text-ink mt-0.5">Welcome back</h2>
            </div>
          </div>
          <p className="text-ink-muted text-sm mb-6">Sign in to continue practicing.</p>

          <form onSubmit={onSubmit} noValidate>
            {fieldError && (
              <div className="bg-danger/10 text-red-600 text-danger text-sm px-3 py-2.5 rounded-lg mb-4">
                {fieldError}
              </div>
            )}

            {needsVerification && (
              <div className="bg-warn/10 border border-warn/30 text-warn text-sm px-3 py-2.5 rounded-lg mb-4">
                Please verify your email first.{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="underline font-medium disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend email"}
                </button>
              </div>
            )}

            <label htmlFor="email" className="text-xs text-ink-muted block mb-1.5">
              Email address
            </label>
            <div className="flex items-center gap-2.5 bg-base-800 border border-base-700 rounded-lg px-3 mb-4 focus-within:border-signal transition">
              <Mail size={17} className="text-ink-muted flex-shrink-0" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none py-2.5 text-sm text-ink placeholder:text-ink-muted"
              />
            </div>

            <label htmlFor="password" className="text-xs text-ink-muted block mb-1.5">
              Password
            </label>
            <div className="flex items-center gap-2.5 bg-base-800 border border-base-700 rounded-lg px-3 focus-within:border-signal transition">
              <LockKeyhole size={17} className="text-ink-muted flex-shrink-0" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none py-2.5 text-sm text-ink placeholder:text-ink-muted"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="text-ink-muted flex-shrink-0"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs text-signal hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 btn-signal text-white rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={17} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-base-700" />
              <span className="text-ink-muted text-xs">or</span>
              <div className="flex-1 h-px bg-base-700" />
            </div>


            <a  href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}/api/auth/google`}
              className="w-full flex items-center justify-center gap-2.5 border border-base-700 hover:border-base-600 rounded-lg py-3 text-sm font-medium text-ink transition"
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>
          </form>

          <p className="text-center text-sm text-ink-muted mt-5">
            New here?{" "}
            <Link to="/register" className="text-signal hover:underline">
              Create an account
            </Link>
          </p>

          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted mt-4">
            <ShieldCheck size={13} />
            Secure, encrypted access
          </p>
        </section>
      </div>

      <footer className="text-center text-xs text-ink-muted pt-6 z-10">
        © 2026 MockAI <span className="mx-1.5">•</span> Privacy <span className="mx-1.5">•</span> Terms
      </footer>
    </main>
  );
}