import { useSelector, useDispatch } from "react-redux";
import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import { logout } from "../../redux/slices/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { useTheme } from "../../context/ThemeContext";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Sun,
    Moon,
    LogOut,
    User,
    Settings,
    LayoutDashboard,
    ChevronDown,
    Sparkles,
    Menu,
    X,
    FileText,
} from "lucide-react";

import toast from "react-hot-toast";

function Navbar() {
    const { user, isAuthenticated } = useSelector(
        (state) => state.auth
    );

    const { theme, toggleTheme } = useTheme();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuRef = useRef(null);

    const shouldHide =
        location.pathname.startsWith("/interview/");

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            dispatch(logout());
            setMenuOpen(false);
            setMobileOpen(false);
            navigate("/login");
        }
    };

    if (shouldHide) {
        return null;
    }

    const initial = (
        user?.name?.[0] ||
        user?.email?.[0] ||
        "U"
    ).toUpperCase();

    const isDark = theme === "dark";

    // Theme-aware navbar colors
    const navbarBg = isDark
        ? "bg-[#242936]"
        : "bg-[#f7f8fb]";

    const navbarBorder = isDark
        ? "border-[#414858]"
        : "border-[#d9dde5]";

    const controlHover = isDark
        ? "hover:bg-[#313747]"
        : "hover:bg-[#e9edf3]";

    const avatarBg = isDark
        ? "bg-[#303746]"
        : "bg-[#e9edf3]";

    const avatarBorder = isDark
        ? "border-[#4a5161]"
        : "border-[#cdd3de]";

    const dropdownBg = isDark
        ? "bg-[#2a3040]"
        : "bg-[#ffffff]";

    const dropdownHeaderBg = isDark
        ? "bg-[#303747]"
        : "bg-[#f1f3f7]";

    const dropdownHover = isDark
        ? "hover:bg-[#394152]"
        : "hover:bg-[#eef1f5]";

    const dropdownBorder = isDark
        ? "border-[#4a5161]"
        : "border-[#d7dce5]";

    return (
        <header
            className={`
                sticky
                top-0
                z-50
                w-full
                ${navbarBg}
                border-b
                ${navbarBorder}
                shadow-[0_2px_12px_rgba(0,0,0,0.08)]
                transition-colors
                duration-200
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">

                    {/* LOGO */}
                    <Link
                        to={
                            isAuthenticated
                                ? "/dashboard"
                                : "/"
                        }
                        className="flex items-center gap-2.5 shrink-0 group"
                    >
                        <div
                            className="
                                w-9
                                h-9
                                rounded-lg
                                bg-signal
                                text-white
                                flex
                                items-center
                                justify-center
                                transition
                                group-hover:scale-[1.04]
                            "
                        >
                            <Sparkles
                                size={17}
                                strokeWidth={2.3}
                            />
                        </div>

                        <div>
                            <div
                                className="
                                    font-display
                                    text-[17px]
                                    font-semibold
                                    tracking-tight
                                    text-ink
                                    leading-none
                                "
                            >
                                MockAI
                            </div>

                            <div
                                className="
                                    hidden
                                    sm:block
                                    text-[10px]
                                    text-ink-muted
                                    mt-1
                                "
                            >
                                AI Interview Platform
                            </div>
                        </div>
                    </Link>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2">

                        {/* Theme */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`
                                w-9
                                h-9
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                text-ink-muted
                                ${controlHover}
                                transition
                            `}
                        >
                            {isDark ? (
                                <Sun size={17} />
                            ) : (
                                <Moon size={17} />
                            )}
                        </button>

                        {/* AUTHENTICATED */}
                        {isAuthenticated ? (
                            <div
                                ref={menuRef}
                                className="relative"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMenuOpen(
                                            (prev) => !prev
                                        )
                                    }
                                    className={`
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        px-1.5
                                        py-1.5
                                        ${
                                            menuOpen
                                                ? isDark
                                                    ? "bg-[#313747]"
                                                    : "bg-[#e9edf3]"
                                                : controlHover
                                        }
                                        transition
                                    `}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`
                                            w-8
                                            h-8
                                            rounded-lg
                                            overflow-hidden
                                            ${avatarBg}
                                            border
                                            ${avatarBorder}
                                            flex
                                            items-center
                                            justify-center
                                            shrink-0
                                        `}
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={
                                                    user?.name ||
                                                    "Profile"
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="
                                                    text-xs
                                                    font-semibold
                                                    text-ink
                                                "
                                            >
                                                {initial}
                                            </span>
                                        )}
                                    </div>

                                    {/* User */}
                                    <div className="hidden md:block text-left max-w-36">
                                        <p className="text-xs font-medium text-ink truncate">
                                            {user?.name ||
                                                "Candidate"}
                                        </p>

                                        <p className="text-[10px] text-ink-muted truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <ChevronDown
                                        size={14}
                                        className={`
                                            hidden
                                            sm:block
                                            text-ink-muted
                                            transition-transform
                                            ${
                                                menuOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                    />
                                </button>

                                {/* DROPDOWN */}
                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: -5,
                                                scale: 0.98,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -5,
                                                scale: 0.98,
                                            }}
                                            transition={{
                                                duration: 0.14,
                                            }}
                                            className={`
                                                absolute
                                                right-0
                                                top-full
                                                mt-2.5
                                                w-64
                                                rounded-xl
                                                border
                                                ${dropdownBorder}
                                                ${dropdownBg}
                                                shadow-[0_14px_38px_rgba(0,0,0,0.18)]
                                                overflow-hidden
                                            `}
                                        >
                                            {/* User info */}
                                            <div
                                                className={`
                                                    px-4
                                                    py-3.5
                                                    border-b
                                                    ${navbarBorder}
                                                    ${dropdownHeaderBg}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`
                                                            w-10
                                                            h-10
                                                            rounded-lg
                                                            overflow-hidden
                                                            ${avatarBg}
                                                            border
                                                            ${avatarBorder}
                                                            flex
                                                            items-center
                                                            justify-center
                                                            shrink-0
                                                        `}
                                                    >
                                                        {user?.avatar ? (
                                                            <img
                                                                src={
                                                                    user.avatar
                                                                }
                                                                alt={
                                                                    user?.name ||
                                                                    "Profile"
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-ink">
                                                                {
                                                                    initial
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-ink truncate">
                                                            {user?.name ||
                                                                "Candidate"}
                                                        </p>

                                                        <p className="text-xs text-ink-muted truncate mt-0.5">
                                                            {
                                                                user?.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-1.5">

                                                {/* Profile */}
                                                <Link
                                                    to="/profile"
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-3
                                                        px-2.5
                                                        py-2.5
                                                        rounded-lg
                                                        text-sm
                                                        text-ink
                                                        ${dropdownHover}
                                                        transition
                                                    `}
                                                >
                                                    <div
                                                        className={`
                                                            w-8
                                                            h-8
                                                            rounded-lg
                                                            ${avatarBg}
                                                            border
                                                            ${avatarBorder}
                                                            flex
                                                            items-center
                                                            justify-center
                                                            shrink-0
                                                        `}
                                                    >
                                                        <User size={15} />
                                                    </div>

                                                    <span>
                                                        Profile
                                                    </span>
                                                </Link>

                                                {/* Settings */}
                                                <Link
                                                    to="/settings"
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-3
                                                        px-2.5
                                                        py-2.5
                                                        rounded-lg
                                                        text-sm
                                                        text-ink
                                                        ${dropdownHover}
                                                        transition
                                                    `}
                                                >
                                                    <div
                                                        className={`
                                                            w-8
                                                            h-8
                                                            rounded-lg
                                                            ${avatarBg}
                                                            border
                                                            ${avatarBorder}
                                                            flex
                                                            items-center
                                                            justify-center
                                                            shrink-0
                                                        `}
                                                    >
                                                        <Settings size={15} />
                                                    </div>

                                                    <span>
                                                        Settings
                                                    </span>
                                                </Link>

                                                {/* Dashboard */}
                                                <Link
                                                    to="/dashboard"
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-3
                                                        px-2.5
                                                        py-2.5
                                                        rounded-lg
                                                        text-sm
                                                        text-ink
                                                        ${dropdownHover}
                                                        transition
                                                    `}
                                                >
                                                    <div
                                                        className={`
                                                            w-8
                                                            h-8
                                                            rounded-lg
                                                            ${avatarBg}
                                                            border
                                                            ${avatarBorder}
                                                            flex
                                                            items-center
                                                            justify-center
                                                            shrink-0
                                                        `}
                                                    >
                                                        <LayoutDashboard
                                                            size={15}
                                                        />
                                                    </div>

                                                    <span>
                                                        Dashboard
                                                    </span>
                                                </Link>

                                                {/* Divider */}
                                                <div
                                                    className={`
                                                        my-1.5
                                                        border-t
                                                        ${navbarBorder}
                                                    `}
                                                />

                                                {/* Logout */}
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleLogout
                                                    }
                                                    className="
                                                        w-full
                                                        flex
                                                        items-center
                                                        gap-3
                                                        px-2.5
                                                        py-2.5
                                                        rounded-lg
                                                        text-sm
                                                        text-red-500
                                                        hover:bg-red-500/10
                                                        transition
                                                    "
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                        <LogOut
                                                            size={15}
                                                        />
                                                    </div>

                                                    <span>
                                                        Log out
                                                    </span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* LOGGED OUT */
                            <div className="hidden sm:flex items-center gap-1">
                                <Link
                                    to="/login"
                                    className={`
                                        px-3.5
                                        py-2
                                        rounded-lg
                                        text-sm
                                        text-ink-muted
                                        ${controlHover}
                                        hover:text-ink
                                        transition
                                    `}
                                >
                                    Log in
                                </Link>

                                <Link
                                    to="/register"
                                    className="
                                        px-4
                                        py-2
                                        rounded-lg
                                        bg-signal
                                        text-white
                                        text-sm
                                        font-medium
                                        hover:opacity-90
                                        transition
                                    "
                                >
                                    Start free
                                </Link>
                            </div>
                        )}

                        {/* Mobile */}
                        <button
                            type="button"
                            onClick={() =>
                                setMobileOpen(
                                    (prev) => !prev
                                )
                            }
                            className={`
                                md:hidden
                                w-9
                                h-9
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                text-ink-muted
                                ${controlHover}
                                transition
                            `}
                            aria-label="Open menu"
                        >
                            {mobileOpen ? (
                                <X size={18} />
                            ) : (
                                <Menu size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        transition={{
                            duration: 0.15,
                        }}
                        className={`
                            md:hidden
                            border-t
                            ${navbarBorder}
                            ${navbarBg}
                        `}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

                            {isAuthenticated ? (
                                <div className="space-y-1">

                                    <Link
                                        to="/dashboard"
                                        className={`
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            py-3
                                            rounded-lg
                                            text-sm
                                            text-ink
                                            ${controlHover}
                                            transition
                                        `}
                                    >
                                        <LayoutDashboard size={17} />
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/profile"
                                        className={`
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            py-3
                                            rounded-lg
                                            text-sm
                                            text-ink
                                            ${controlHover}
                                            transition
                                        `}
                                    >
                                        <User size={17} />
                                        Profile
                                    </Link>

                                    <Link
                                        to="/settings"
                                        className={`
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            py-3
                                            rounded-lg
                                            text-sm
                                            text-ink
                                            ${controlHover}
                                            transition
                                        `}
                                    >
                                        <Settings size={17} />
                                        Settings
                                    </Link>

                                    <div
                                        className={`
                                            my-2
                                            border-t
                                            ${navbarBorder}
                                        `}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="
                                            w-full
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            py-3
                                            rounded-lg
                                            text-sm
                                            text-red-500
                                            hover:bg-red-500/10
                                            transition
                                        "
                                    >
                                        <LogOut size={17} />
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        to="/login"
                                        className={`
                                            w-full
                                            text-center
                                            px-4
                                            py-3
                                            rounded-lg
                                            text-sm
                                            text-ink
                                            ${controlHover}
                                            transition
                                        `}
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="
                                            w-full
                                            text-center
                                            px-4
                                            py-3
                                            rounded-lg
                                            bg-signal
                                            text-white
                                            text-sm
                                            font-medium
                                            hover:opacity-90
                                            transition
                                        "
                                    >
                                        Start free
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Navbar;