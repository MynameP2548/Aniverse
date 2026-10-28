"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onEnter: () => void;
};

export default function WelcomeScreen({
  open,
  onEnter,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <div className="text-center max-w-lg px-8">
            <h1 className="text-6xl font-black text-white tracking-widest">
              ANIVERSE
            </h1>

            <p className="mt-5 text-zinc-400">
              Welcome to the next generation anime streaming experience.
            </p>

            <button
              onClick={onEnter}
              className="mt-10 px-10 py-4 rounded-full bg-violet-600 hover:bg-violet-500 transition text-white font-semibold"
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}