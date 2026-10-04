import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMessageCircle,
  FiPlusSquare,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "./UI";

const desktopLinks = [
  { name: "Home", path: "/", icon: FiHome },
  { name: "Messages", path: "/messages", icon: FiMessageCircle },
  { name: "Communities", path: "/communities", icon: FiUsers },
  { name: "Notifications", path: "/notifications", icon: FiBell },
  { name: "Create Group", path: "/groups/create", icon: FiPlusSquare },
  { name: "Search", path: "/search", icon: FiSearch },
  { name: "Profile", path: "/profile", icon: FiUser },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "You");
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || undefined);

  useEffect(() => {
    const handleProfileUpdate = (e: CustomEvent) => {
      if (e.detail?.name) setUserName(e.detail.name);
      if (e.detail?.avatarUrl !== undefined) setUserAvatar(e.detail.avatarUrl || undefined);
    };
    window.addEventListener("profile-updated", handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate as EventListener);
    };
  }, []);

  // Close more menu on route changes
  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const signOut = () => {
    setShowMoreMenu(false);
    logout();
    navigate("/login", { replace: true });
  };

  const isMoreActive =
    showMoreMenu ||
    isActive("/profile") ||
    isActive("/search") ||
    isActive("/groups/create");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-3 px-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-xl font-black text-white shadow-lg shadow-indigo-200">
            C
          </span>
          <span>
            <b className="block text-lg tracking-tight text-slate-900">College Media</b>
            <small className="text-xs text-slate-500">Your campus, connected</small>
          </span>
        </Link>

        <nav className="space-y-1 overflow-y-auto pr-1" aria-label="Primary navigation">
          {desktopLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                isActive(path)
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <Icon className="text-lg" />
              {name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 px-1">
              <Avatar name={userName} src={userAvatar} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">{userName}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (5 core touch-friendly items) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden shadow-lg"
        aria-label="Mobile navigation"
      >
        <Link
          to="/"
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
            isActive("/") ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <FiHome className="text-lg" />
          <span>Home</span>
        </Link>

        <Link
          to="/messages"
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
            isActive("/messages") ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <FiMessageCircle className="text-lg" />
          <span>Messages</span>
        </Link>

        <Link
          to="/communities"
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
            isActive("/communities") ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <FiUsers className="text-lg" />
          <span>Communities</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
            isActive("/notifications") ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
        >
          <FiBell className="text-lg" />
          <span>Alerts</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowMoreMenu((prev) => !prev)}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
            isMoreActive ? "text-indigo-600 font-bold" : "text-slate-500"
          }`}
          aria-label="More options"
        >
          <FiMenu className="text-lg" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile More Navigation Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />

          {/* Sheet */}
          <div className="relative z-10 rounded-t-3xl border-t border-slate-200 bg-white p-5 pb-8 shadow-2xl animate-float-in max-h-[85vh] overflow-y-auto">
            {/* Handle / Header */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <Avatar name={userName} src={userAvatar} size="sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-400">Campus Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="space-y-1">
              <Link
                to="/profile"
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive("/profile")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FiUser className="text-lg text-indigo-500" />
                  Your Profile
                </span>
                <FiChevronRight className="text-slate-400 text-sm" />
              </Link>

              <Link
                to="/search"
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive("/search")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FiSearch className="text-lg text-indigo-500" />
                  Search Campus
                </span>
                <FiChevronRight className="text-slate-400 text-sm" />
              </Link>

              <Link
                to="/groups/create"
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive("/groups/create")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FiPlusSquare className="text-lg text-indigo-500" />
                  Create Group
                </span>
                <FiChevronRight className="text-slate-400 text-sm" />
              </Link>

            </div>

            {/* Logout row */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <FiLogOut className="text-lg" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
