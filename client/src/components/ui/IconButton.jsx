import React from "react";

export default function IconButton({ icon, onClick, label, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/30 text-slate-900 shadow-sm transition hover:bg-white/50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      {icon}
    </button>
  );
}

