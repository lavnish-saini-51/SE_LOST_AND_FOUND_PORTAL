import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:opacity-50";
  const styles =
    variant === "secondary"
      ? "border border-white/20 bg-white/30 text-slate-900 hover:bg-white/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

