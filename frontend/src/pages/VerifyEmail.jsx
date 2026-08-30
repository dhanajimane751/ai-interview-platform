import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const res = await axiosInstance.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-primary-400" size={40} />
            <h2 className="font-display text-xl font-bold text-ink mb-1">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-success" size={40} />
            <h2 className="font-display text-xl font-bold text-ink mb-2">Email Verified</h2>
            <p className="text-ink-muted text-sm mb-6">{message}</p>
            <Link to="/login" className="btn-gradient text-white px-6 py-2.5 rounded-lg font-medium inline-block">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 text-danger" size={40} />
            <h2 className="font-display text-xl font-bold text-ink mb-2">Verification Failed</h2>
            <p className="text-ink-muted text-sm mb-6">{message}</p>
            <Link to="/login" className="text-primary-400 hover:text-primary-300 text-sm underline">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;