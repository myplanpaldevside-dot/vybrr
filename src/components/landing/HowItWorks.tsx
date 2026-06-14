import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Explore thousands of talented creators across design, video, music, code, and more.",
    iconAnim: { rotate: [0, -15, 15, -10, 10, 0], transition: { duration: 0.7, ease: "easeInOut" } },
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description: "Choose a Vyb package, share your brief, and pay securely. Funds are held safely until delivery.",
    iconAnim: { scale: [1, 1.25, 0.95, 1.1, 1], transition: { duration: 0.6, ease: "easeOut" } },
  },
  {
    icon: Rocket,
    title: "Get it done",
    description: "Collaborate in real-time, receive your deliverables, and release payment when you're happy.",
    iconAnim: { y: [0, -12, 2, -6, 0], transition: { duration: 0.7, ease: "easeOut" } },
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.18, duration: 0.55, ease: "easeOut" }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Giant watermark number */}
      <span
        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7rem] font-black leading-none select-none pointer-events-none font-heading text-muted-foreground/[0.07] z-0"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Step indicator dot (sits on the connecting line) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.18 + 0.1, type: "spring", stiffness: 260, damping: 16 }}
        className="relative z-20 w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/40 border-4 border-background"
      >
        <span className="text-white font-heading font-bold text-sm">{index + 1}</span>
      </motion.div>

      {/* Icon box */}
      <motion.div
        animate={isInView ? (step.iconAnim as any) : {}}
        className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center mb-5 shadow-lg shadow-primary/10 group-hover:shadow-primary/25 group-hover:border-primary/50 transition-shadow duration-300"
      >
        <step.icon size={26} className="text-primary" />
      </motion.div>

      <h3 className="text-xl font-heading font-bold mb-3 relative z-10">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] relative z-10">
        {step.description}
      </p>
    </motion.div>
  );
}

export function HowItWorks() {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            How <span className="gradient-text">Vybrr</span> works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to creative collaboration.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) — sits behind the step dots */}
          <div
            ref={lineRef}
            className="hidden md:block absolute top-6 left-0 right-0 h-px pointer-events-none z-10"
            style={{ marginLeft: "calc(16.67% + 24px)", marginRight: "calc(16.67% + 24px)" }}
          >
            {/* Static track */}
            <div className="absolute inset-0 bg-border" />
            {/* Animated fill */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60"
              initial={{ scaleX: 0, originX: 0 }}
              animate={lineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            />
            {/* Glow */}
            <motion.div
              className="absolute inset-0 blur-sm bg-gradient-to-r from-primary/40 via-primary/70 to-primary/40"
              initial={{ scaleX: 0, originX: 0 }}
              animate={lineInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            />
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
