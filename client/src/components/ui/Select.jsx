import React from "react";

export default function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div> : null}
      <select
        {...props}
        className="w-full rounded-lg border-white/20 bg-white/50 text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-indigo-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}

