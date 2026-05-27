import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"connect" | "spark" | "exit">("connect");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spark"), 1200);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(onComplete, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Ambient background glow */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[100px]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="relative flex items-center justify-center">
            {/* Two halves that connect */}
            <motion.div
              className="relative flex items-center gap-0"
              initial={{ gap: 80 }}
              animate={{ gap: phase === "connect" ? 80 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Left node */}
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
              </motion.div>

              {/* Connection line */}
              <motion.div
                className="h-[3px] bg-gradient-to-r from-primary/80 via-primary to-primary/80 rounded-full origin-left"
                initial={{ scaleX: 0, width: 80 }}
                animate={{
                  scaleX: phase === "connect" ? [0, 1] : 1,
                  width: phase === "connect" ? 80 : 0,
                }}
                transition={{ duration: 0.6, delay: phase === "connect" ? 0.3 : 0, ease: "easeInOut" }}
              />

              {/* Right node */}
              <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-xl shadow-accent/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>

            {/* Spark effect on connection */}
            {phase === "spark" && (
              <>
                {/* Central spark burst */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary shadow-[0_0_40px_20px_hsl(var(--primary)/0.5)]" />
                </motion.div>

                {/* Spark particles */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * 360;
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary z-20"
                      style={{ left: "50%", top: "50%", marginLeft: -4, marginTop: -4 }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(rad) * 80,
                        y: Math.sin(rad) * 80,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  );
                })}

                {/* Expanding ring */}
                <motion.div
                  className="absolute rounded-full border-2 border-primary/50 z-10"
                  style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%" }}
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </>
            )}

            {/* Logo reveal after spark */}
            <motion.div
              className="absolute flex flex-col items-center gap-3 z-30"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: phase === "spark" ? 1 : 0,
                scale: phase === "spark" ? 1 : 0.5,
              }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <svg width="64" height="64" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="drop-shadow-2xl">
                <circle cx="20" cy="20" r="20" fill="#7c5cfc" />
                <circle cx="15" cy="20" r="7.5" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
                <circle cx="25" cy="20" r="7.5" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
              </svg>
              <motion.span
                className="text-xl font-heading font-extrabold tracking-tight gradient-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: phase === "spark" ? 1 : 0, y: phase === "spark" ? 0 : 10 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                Vybrr
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
