import React from "react";
import { motion } from "framer-motion";
import { MapPin, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../lib/image";

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const badge =
    item.type === "lost"
      ? "bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-500/25"
      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/25";
  const img = resolveImageUrl(item?.image?.url);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass overflow-hidden rounded-xl cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/items/${item.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/items/${item.id}`);
      }}
    >
        <div className="relative h-40 w-full overflow-hidden bg-slate-200/40 dark:bg-white/5">
          {img ? (
            <img src={img} alt={item.itemName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              No image
            </div>
          )}
          <div className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge}`}>
            {item.type === "lost" ? "Lost" : "Found"}
          </div>
          {item.type === "lost" && item.resolved ? (
            <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white/10">
              Resolved
            </div>
          ) : null}
          {item.type === "lost" && !item.resolved ? (
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/items/${item.id}?claim=1`);
                }}
                className="rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/15"
              >
                I Found This
              </button>
            </div>
          ) : null}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{item.itemName}</div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{item.description}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2 py-1 dark:border-white/10 dark:bg-white/5">
              <Tag className="h-3.5 w-3.5" />
              {item.category}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2 py-1 dark:border-white/10 dark:bg-white/5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-[180px] truncate">{item.location}</span>
            </div>
          </div>
        </div>
    </motion.div>
  );
}
