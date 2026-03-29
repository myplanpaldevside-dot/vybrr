import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-glow/8 rounded-full blur-[100px] animate-pulse-glow [animation-delay:2s]" />

      <div className="container relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/30 bg-violet/10 text-sm text-violet-glow mb-8"
          >
            <Sparkles size={14} />
            <span>The creator marketplace for the bold</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.1] tracking-tight mb-6 text-balance">
            Where creativity{" "}
            <span className="gradient-text">connects.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            Hire world-class digital creators or showcase your work and get paid.
            Designers, editors, musicians, developers — all in one vibe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12 gap-2" asChild>
              <Link to="/explore">
                Find a Creator
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 border-border hover:bg-surface-elevated" asChild>
              <Link to="/signup">
                Start Creating
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { value: "12K+", label: "Creators" },
            { value: "85K+", label: "Orders completed" },
            { value: "140+", label: "Countries" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
