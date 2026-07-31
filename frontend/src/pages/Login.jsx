import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { setCredentials } from "../redux/slices/authSlice";
import { useState } from "react";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await axiosInstance.post("/auth/login", data);
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-glow-radial blur-2xl -z-10" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card rounded-2xl p-8 w-full max-w-md space-y-5 shadow-card"
      >
        <div>
          <h2 className="font-display text-2xl font-bold">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Pick up where you left off.</p>
        </div>

        {serverError && (
          <p className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-base-900 border border-base-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-base-900 border border-base-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full btn-gradient text-white py-2.5 rounded-lg font-medium shadow-glow"
        >
          Log in
        </button>

        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="text-primary-400 hover:text-primary-300">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;