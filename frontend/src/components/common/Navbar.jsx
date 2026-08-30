import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, LogOut, User } from "lucide-react";
import toast from "react-hot-toast";
import { Settings as SettingsIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const shouldHide = location.pathname.startsWith("/interview/");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out");
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      setMenuOpen(false);
      navigate("/login");
    }
  };

  if (shouldHide) return null;

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-40 bg-base-950/95 backdrop-blur border-b border-base-700">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-signal text-white flex items-center justify-center">
          <Sparkles size={16} strokeWidth={2.5} />
        </span>
          <span className="font-display font-semibold text-sm tracking-tight text-ink">MockAI</span>
        </Link>
        <Link
  to="/settings"
  onClick={() => setMenuOpen(false)}
  className="flex items-center gap-2 px-2.5 py-2 text-sm text-ink hover:bg-base-800 rounded-md transition"
>
  <SettingsIcon size={14} /> Settings
</Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-md flex items-center justify-center border border-base-700 hover:border-base-600 text-ink-muted transition"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="w-8 h-8 rounded-md border border-base-700 flex items-center justify-center text-xs font-mono-data font-semibold text-ink hover:border-base-600 transition"
              >
                {initial}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-52 card rounded-lg p-1.5 shadow-card"
                  >
                    <div className="px-2.5 py-2 border-b border-base-700 mb-1">
                      <p className="text-sm font-medium truncate text-ink">{user?.name || "Candidate"}</p>
                      <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 text-sm text-ink hover:bg-base-800 rounded-md transition"
                    >
                      <User size={14} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-sm text-signal hover:bg-signal/10 rounded-md transition"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="text-sm text-ink-muted hover:text-ink px-3 py-1.5 transition">
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-signal text-white text-sm px-3.5 py-1.5 rounded-md font-medium"
              >
                Start free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;