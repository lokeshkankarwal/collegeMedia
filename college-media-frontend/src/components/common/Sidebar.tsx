import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiHome, FiLogOut, FiMessageCircle, FiPlusSquare, FiSearch, FiUser, FiUsers } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";

const links = [
  { name: "Home", path: "/", icon: FiHome }, { name: "Messages", path: "/messages", icon: FiMessageCircle },
  { name: "Create Group", path: "/groups/create", icon: FiPlusSquare }, { name: "Communities", path: "/communities", icon: FiUsers },
  { name: "Notifications", path: "/notifications", icon: FiBell }, { name: "Search", path: "/search", icon: FiSearch },
  { name: "Profile", path: "/profile", icon: FiUser },
];

export default function Sidebar() {
  const location = useLocation(); const navigate = useNavigate(); const logout = useAuthStore((state) => state.logout);
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  const signOut = () => { logout(); navigate("/login"); };
  return <>
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <Link to="/" className="mb-8 flex items-center gap-3 px-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-xl font-black text-white shadow-lg shadow-indigo-200">C</span><span><b className="block text-lg tracking-tight text-slate-900">College Media</b><small className="text-xs text-slate-500">Your campus, connected</small></span></Link>
      <nav className="space-y-1" aria-label="Primary navigation">{links.map(({ name, path, icon: Icon }) => <Link key={path} to={path} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive(path) ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}><Icon className="text-lg" />{name}</Link>)}</nav>
      <div className="mt-auto rounded-2xl bg-slate-50 p-3"><p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Campus space</p><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"><FiLogOut />Logout</button></div>
    </aside>
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden" aria-label="Mobile navigation">
      {links.filter(({ path }) => ["/", "/search", "/groups/create", "/messages", "/profile"].includes(path)).map(({ name, path, icon: Icon }) => <Link key={path} to={path} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${isActive(path) ? "text-indigo-600" : "text-slate-500"}`}><Icon className="text-lg" /><span className="truncate">{name === "Create Group" ? "Create" : name}</span></Link>)}
    </nav>
  </>;
}
