import React from "react";

export default function Input({ label, hint, ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div> : null}
      <input
        {...props}
        className="w-full rounded-lg border-white/20 bg-white/50 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
      />
      {hint ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </label>
  );
}

