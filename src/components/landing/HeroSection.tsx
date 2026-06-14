import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CreatorOrbit } from "./CreatorOrbit";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-mesh" />

      <div className="container relative z-10 px-4 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[calc(100vh-4rem)]">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-6"
            >
              <Sparkles size={14} />
              <span>The creator marketplace for the bold</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold leading-[1.08] tracking-tight mb-5 text-balance">
              Where creativity{" "}
              <span className="gradient-text">connects.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-8 text-balance leading-relaxed">
              Hire world-class digital creators or showcase your work and get paid.
              Designers, editors, musicians, developers, all in one vibe.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Button size="lg" className="text-base px-8 h-12 gap-2" asChild>
                <Link to="/explore">
                  Find a Creator
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
                <Link to="/signup">Start Creating</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: "🔒", label: "Secure payments" },
                { icon: "⚡", label: "Fast delivery" },
                { icon: "🌍", label: "African creators" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Orbital animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <CreatorOrbit />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
