import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    logout();
    setMenuOpen(false);
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

  /* Always visible on mobile bottom bar — fits 320px screens without scrolling */
  const quickLinkPaths = ["/", "/messages", "/communities", "/profile"];
  const quickLinks = links.filter(
    (link) => link.path && quickLinkPaths.includes(link.path)
  );

  /* Remaining links shown in the Menu drawer (Create Group, Notifications, Search, Logout) */
  const drawerLinks = links.filter(
    (link) =>
      link.logout ||
      (link.path && !quickLinkPaths.includes(link.path))
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClassName = (isActive: boolean) => `
    block
    p-3
    rounded-lg
    transition-colors
    text-left
    ${
      isActive
        ? "bg-black text-white"
        : "hover:bg-gray-100"
    }
  `;

  const bottomNavItemClass = (isActive: boolean) => `
    flex
    flex-1
    flex-col
    items-center
    justify-center
    min-w-0
    px-1
    py-2
    text-xs
    rounded-lg
    transition-colors
    ${
      isActive
        ? "bg-black text-white font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }
  `;

  const renderNavLink = (
    link: (typeof links)[number],
    className: string,
    onNavigate?: () => void
  ) => {
    if (link.logout) {
      return (
        <button
          key={link.name}
          type="button"
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className={className}
        >
          {link.name}
        </button>
      );
    }

    return (
      <Link
        key={link.name}
        to={link.path!}
        onClick={onNavigate}
        className={className}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar — hidden below md breakpoint */}
      <div
        className="
          w-64
          shrink-0
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
          {links.map((link) =>
            renderNavLink(
              link,
              linkClassName(
                !link.logout &&
                  location.pathname === link.path
              )
            )
          )}
        </div>
      </div>

      {/* Mobile Menu drawer — overflow links + Logout */}
      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="
              fixed
              inset-0
              z-50
              bg-black/50
              md:hidden
            "
            onClick={() => setMenuOpen(false)}
          />

          <div
            className="
              fixed
              bottom-16
              left-0
              right-0
              z-50
              mx-3
              rounded-xl
              border
              bg-white
              p-4
              shadow-lg
              md:hidden
            "
            role="dialog"
            aria-label="More navigation"
          >
            <div className="space-y-2">
              {drawerLinks.map((link) =>
                renderNavLink(
                  link,
                  linkClassName(
                    !link.logout &&
                      location.pathname === link.path
                  ),
                  () => setMenuOpen(false)
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom bar — 4 quick links + Menu; all items fit on screen */}
      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-40
          flex
          items-center
          border-t
          bg-white
          px-1
          py-1
          md:hidden
        "
        aria-label="Mobile navigation"
      >
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path!}
            className={bottomNavItemClass(
              location.pathname === link.path
            )}
          >
            <span className="truncate w-full text-center">
              {link.name}
            </span>
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={bottomNavItemClass(menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Open menu"
        >
          <span className="truncate w-full text-center">
            Menu
          </span>
        </button>
      </nav>
    </>
  );
}
