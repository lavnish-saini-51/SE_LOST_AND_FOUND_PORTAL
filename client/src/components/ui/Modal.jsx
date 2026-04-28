import React, { useEffect } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton.jsx";

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative w-full max-w-lg rounded-2xl p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Share how to reach you and a short message.
            </div>
          </div>
          <IconButton label="Close" onClick={onClose} icon={<X className="h-4 w-4" />} />
        </div>
        {children}
      </div>
    </div>
  );
}

