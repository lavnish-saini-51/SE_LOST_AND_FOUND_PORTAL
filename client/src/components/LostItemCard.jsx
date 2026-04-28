import React from "react";
import { MapPin, CalendarDays, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./ui/Button.jsx";
import { resolveImageUrl } from "../lib/image";

export default function LostItemCard({ item }) {
  const img = resolveImageUrl(item?.image?.url);
  return (
    <motion.div whileHover={{ y: -4 }} className="glass overflow-hidden rounded-2xl">
      <div className="relative h-44 w-full overflow-hidden bg-slate-200/40 dark:bg-white/5">
        {img ? (
          <img src={img} alt={item.itemName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
        )}
        {item.resolved ? (
          <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white/10">
            Resolved
          </div>
        ) : null}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{item.itemName}</div>
            <div className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-slate-700 dark:text-slate-200">
          <div className="inline-flex items-center gap-2">
            <Tag className="h-4 w-4 opacity-80" />
            <span className="font-semibold">{item.category}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-80" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-80" />
            <span>{item.date ? new Date(item.date).toLocaleDateString() : "—"}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Posted {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
          </div>
          <Link to={`/items/${item.id}`}>
            <Button variant="secondary">View details</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
