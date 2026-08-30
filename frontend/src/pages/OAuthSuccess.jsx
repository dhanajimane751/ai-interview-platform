import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("accessToken", token);

    axiosInstance
      .get("/auth/me")
      .then((res) => {
        dispatch(setCredentials({ user: res.data.user, accessToken: token }));
        toast.success("Logged in with Google");
        navigate("/dashboard");
      })
      .catch(() => {
        toast.error("Google login failed");
        navigate("/login");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-ink-muted text-sm">Signing you in...</p>
    </div>
  );
}

export default OAuthSuccess;