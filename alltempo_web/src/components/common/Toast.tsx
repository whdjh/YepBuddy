"use client";

import { useToastStore } from "@/stores/useToastStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast() {
  const { message, visible } = useToastStore();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-md fixed bottom-8 left-1/2 z-[9999] flex h-12 w-70 -translate-x-1/2 items-center justify-center rounded-full bg-[#16a34a] px-4 py-2 text-center font-semibold text-white shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}