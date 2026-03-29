import { motion } from "framer-motion";
import { Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse",
    description: "Explore thousands of talented creators across design, video, music, code, and more.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description: "Choose a Vyb package, share your brief, and pay securely. Funds are held safely until delivery.",
  },
  {
    icon: Rocket,
    title: "Get it done",
    description: "Collaborate in real-time, receive your deliverables, and release payment when you're happy.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            How <span className="gradient-text">Vybrr</span> works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to creative collaboration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mx-auto mb-5">
                <step.icon size={28} className="text-violet" />
              </div>

              {/* Step number */}
              <div className="absolute top-0 right-1/2 translate-x-[3.5rem] -translate-y-2 text-xs font-heading font-bold text-violet/60 bg-background px-2">
                {String(i + 1).padStart(2, "0")}
              </div>

              <h3 className="text-xl font-heading font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
