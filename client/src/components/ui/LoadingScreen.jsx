import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass flex items-center gap-3 rounded-xl px-5 py-4"
      >
        <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
        <div className="text-sm text-slate-700 dark:text-slate-200">Loading…</div>
      </motion.div>
    </div>
  );
}

