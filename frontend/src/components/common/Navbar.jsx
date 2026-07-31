import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Hide navbar entirely inside the live interview room (it has its own header)
  const hideOnRoutes = ["/interview/"];
  const shouldHide = hideOnRoutes.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      dispatch(logout());
      setMenuOpen(false);
      navigate("/login");
    }
  };

  if (shouldHide) return null;

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-40 bg-base-950/80 backdrop-blur-md border-b border-base-700 px-6 py-3 flex items-center justify-between">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full signature-ring p-[2px]">
          <div className="w-full h-full rounded-full bg-base-950 flex items-center justify-center text-xs">
            🎙️
          </div>
        </div>
        <span className="font-display font-semibold text-sm">MockAI</span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className={`text-sm transition ${
              location.pathname === "/dashboard"
                ? "text-primary-400 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dashboard
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full signature-ring p-[2px]"
            >
              <div className="w-full h-full rounded-full bg-base-900 flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-2 shadow-card">
                <div className="px-3 py-2 border-b border-base-700 mb-1">
                  <p className="text-sm font-medium truncate">{user?.name || "Candidate"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:bg-base-800 rounded-lg"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-base-800 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200">
            Login
          </Link>
          <Link
            to="/register"
            className="btn-gradient text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;