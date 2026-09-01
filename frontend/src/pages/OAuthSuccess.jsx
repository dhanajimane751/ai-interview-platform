import { useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  setCredentials,
} from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";

function OAuthSuccess() {
  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  const dispatch =
    useDispatch();

  useEffect(() => {
    const token =
      searchParams.get("token");

    if (!token) {
      toast.error(
        "Google login failed",
        {
          id: "google-login-error",
        }
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    const processedKey =
      `google-oauth-${token}`;

    if (
      sessionStorage.getItem(
        processedKey
      )
    ) {
      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    sessionStorage.setItem(
      processedKey,
      "true"
    );

    localStorage.setItem(
      "accessToken",
      token
    );

    axiosInstance
      .get("/auth/me")
      .then((res) => {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: token,
          })
        );

        toast.success(
          "Logged in with Google",
          {
            id: "google-login-success",
          }
        );

        navigate("/dashboard", {
          replace: true,
        });
      })
      .catch((error) => {
        console.error(
          "Google authentication error:",
          error
        );

        sessionStorage.removeItem(
          processedKey
        );

        localStorage.removeItem(
          "accessToken"
        );

        toast.error(
          "Google login failed",
          {
            id: "google-login-error",
          }
        );

        navigate("/login", {
          replace: true,
        });
      });
  }, [
    searchParams,
    navigate,
    dispatch,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-ink-muted">
        Signing you in...
      </p>
    </div>
  );
}

export default OAuthSuccess;