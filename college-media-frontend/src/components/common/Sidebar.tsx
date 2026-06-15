import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    logout();

    navigate("/login");
  };

  const links = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Messages",
      path: "/messages",
    },
    {
      name: "Create Group",
      path: "/groups/create",
    },
    {
      name: "Communities",
      path: "/communities",
    },
    {
      name: "Notifications",
      path: "/notifications",
    },
    {
      name: "Search",
      path: "/search",
    },
    {
      name: "Profile",
      path: "/profile",
    },
    {
      name: "Logout",
      logout: true,
    },
  ];

  return (
    <div
      className="
        w-64
        border-r
        p-6
        hidden
        md:block
      "
    >
      <h1
        className="
          text-2xl
          font-bold
          mb-8
        "
      >
        College Media
      </h1>

      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.logout ? "#" : link.path!}
            onClick={
              link.logout
                ? (e) => {
                    e.preventDefault();
                    handleLogout();
                  }
                : undefined
            }
            className={`
              block
              p-3
              rounded-lg
              transition-colors
              ${
                !link.logout &&
                location.pathname === link.path
                  ? "bg-black text-white"
                  : "hover:bg-white/10"
              }
            `}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}