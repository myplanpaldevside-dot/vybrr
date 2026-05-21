import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, Video, Music, PenTool, Code, Camera, Clapperboard, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  design: Palette,
  video: Video,
  music: Music,
  writing: PenTool,
  code: Code,
  photography: Camera,
  animation: Clapperboard,
};

const fallbackCategories = [
  { name: "Design", slug: "design", icon: "design", count: "3.2K creators" },
  { name: "Video", slug: "video", icon: "video", count: "1.8K creators" },
  { name: "Music", slug: "music", icon: "music", count: "1.4K creators" },
  { name: "Writing", slug: "writing", icon: "writing", count: "2.1K creators" },
  { name: "Code", slug: "code", icon: "code", count: "2.6K creators" },
  { name: "Photography", slug: "photography", icon: "photography", count: "1.1K creators" },
  { name: "Animation", slug: "animation", icon: "animation", count: "890 creators" },
];

export function CategoryBrowser() {
  const { data: categories } = useQuery({
    queryKey: ["categories-landing"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const display = categories && categories.length > 0 ? categories : fallbackCategories;

  return (
    <section id="categories" className="py-24 bg-muted/30">
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
          {display.map((cat: any, i: number) => {
            const slugKey = (cat.slug || cat.name || "").toLowerCase();
            const Icon = iconMap[slugKey] || Layers;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/explore?category=${cat.slug || slugKey}`}
                  className="glass-card-hover p-5 flex flex-col items-center gap-3 text-center group block"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.count || "Browse"}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
