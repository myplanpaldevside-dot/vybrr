import { motion } from "framer-motion";
import { Palette, Video, Music, PenTool, Code, Camera, Clapperboard } from "lucide-react";

const categories = [
  { name: "Design", icon: Palette, count: "3.2K creators" },
  { name: "Video", icon: Video, count: "1.8K creators" },
  { name: "Music", icon: Music, count: "1.4K creators" },
  { name: "Writing", icon: PenTool, count: "2.1K creators" },
  { name: "Code", icon: Code, count: "2.6K creators" },
  { name: "Photography", icon: Camera, count: "1.1K creators" },
  { name: "Animation", icon: Clapperboard, count: "890 creators" },
];

export function CategoryBrowser() {
  return (
    <section id="categories" className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Browse by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find the perfect creator for any type of project.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 flex flex-col items-center gap-3 text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center group-hover:bg-violet/20 transition-colors">
                <cat.icon size={22} className="text-violet" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
