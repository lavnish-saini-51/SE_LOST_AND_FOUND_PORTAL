import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, LogOut, Menu, Moon, PlusCircle, Search, Sun, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";
import IconButton from "./ui/IconButton.jsx";

function navClass({ isActive }) {
  const base =
    "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
    "hover:bg-white/30 hover:dark:bg-white/10";
  return isActive
    ? `${base} bg-white/40 dark:bg-white/10`
    : `${base} text-slate-700 dark:text-slate-200`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/lost", label: "Lost" },
      { to: "/search", label: "Browse" }
    ],
    []
  );

  async function onLogout() {
    try {
      await logout();
      toast.success("Logged out");
      navigate("/");
      setOpen(false);
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <div className="sticky top-0 z-30 border-b border-white/20 bg-white/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/30">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/90 to-cyan-400/90 text-white shadow"
          >
            <Search className="h-5 w-5" />
          </motion.div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Lost & Found</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Item Portal</div>
          </div>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/report/lost" className={navClass}>
                Report Lost
              </NavLink>
              <NavLink to="/report/found" className={navClass}>
                Report Found
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <IconButton
              label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              icon={open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            />
          </div>
          <IconButton
            label={theme === "dark" ? "Switch to light" : "Switch to dark"}
            onClick={toggle}
            icon={theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          />

          {user ? (
            <>
              <IconButton
                label="Notifications"
                onClick={() => navigate("/notifications")}
                icon={<Bell className="h-4 w-4" />}
              />
              <IconButton
                label="New post"
                onClick={() => navigate("/report/lost")}
                icon={<PlusCircle className="h-4 w-4" />}
              />
              <IconButton
                label="Profile"
                onClick={() => navigate("/profile")}
                icon={<UserRound className="h-4 w-4" />}
              />
              <IconButton label="Logout" onClick={onLogout} icon={<LogOut className="h-4 w-4" />} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white/30 dark:text-white dark:hover:bg-white/10"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/20 bg-white/20 px-4 py-3 dark:border-white/10 dark:bg-slate-950/20 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/dashboard" className={navClass} onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/report/lost" className={navClass} onClick={() => setOpen(false)}>
                  Report Lost
                </NavLink>
                <NavLink to="/report/found" className={navClass} onClick={() => setOpen(false)}>
                  Report Found
                </NavLink>
                <NavLink to="/notifications" className={navClass} onClick={() => setOpen(false)}>
                  Notifications
                </NavLink>
                <NavLink to="/profile" className={navClass} onClick={() => setOpen(false)}>
                  Profile
                </NavLink>
                {user.role === "admin" ? (
                  <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
                    Admin
                  </NavLink>
                ) : null}
                <button type="button" className={navClass({ isActive: false })} onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
