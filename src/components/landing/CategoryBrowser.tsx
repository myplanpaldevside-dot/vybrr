import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, Video, Music, PenTool, Code, Camera, Clapperboard, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CatStyle {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  glow: string;
}

const iconMap: Record<string, React.ElementType> = {
  design: Palette,
  video: Video,
  music: Music,
  writing: PenTool,
  code: Code,
  photography: Camera,
  animation: Clapperboard,
};

const catStyles: Record<string, CatStyle> = {
  design: {
    gradient: "from-violet-500/20 to-purple-600/10",
    border: "border-violet-500/30 hover:border-violet-400/70",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    glow: "hover:shadow-violet-500/30",
  },
  video: {
    gradient: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/30 hover:border-red-400/70",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    glow: "hover:shadow-red-500/30",
  },
  music: {
    gradient: "from-cyan-500/20 to-sky-500/10",
    border: "border-cyan-500/30 hover:border-cyan-400/70",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/30",
  },
  writing: {
    gradient: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-500/30 hover:border-amber-400/70",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/30",
  },
  code: {
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/30 hover:border-emerald-400/70",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-emerald-500/30",
  },
  photography: {
    gradient: "from-pink-500/20 to-rose-500/10",
    border: "border-pink-500/30 hover:border-pink-400/70",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
    glow: "hover:shadow-pink-500/30",
  },
  animation: {
    gradient: "from-indigo-500/20 to-blue-600/10",
    border: "border-indigo-500/30 hover:border-indigo-400/70",
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    glow: "hover:shadow-indigo-500/30",
  },
};

const defaultStyle: CatStyle = {
  gradient: "from-primary/20 to-primary/10",
  border: "border-primary/30 hover:border-primary/70",
  iconBg: "bg-primary/15",
  iconColor: "text-primary",
  glow: "hover:shadow-primary/30",
};

const fallbackCategories = [
  { name: "Design", slug: "design" },
  { name: "Video", slug: "video" },
  { name: "Music", slug: "music" },
  { name: "Writing", slug: "writing" },
  { name: "Code", slug: "code" },
  { name: "Photography", slug: "photography" },
  { name: "Animation", slug: "animation" },
];

function CatCard({ cat, slugKey, Icon, style }: { cat: any; slugKey: string; Icon: React.ElementType; style: CatStyle }) {
  return (
    <Link
      to={`/explore?category=${cat.slug || slugKey}`}
      className={[
        "group flex items-center gap-3 px-5 py-3.5 rounded-2xl border",
        "bg-gradient-to-br backdrop-blur-sm",
        style.gradient, style.border, style.glow,
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-lg",
        "shrink-0 select-none",
      ].join(" ")}
    >
      <div
        className={[
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          style.iconBg,
          "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
        ].join(" ")}
      >
        <Icon size={18} className={style.iconColor} />
      </div>
      <div className="shrink-0">
        <p className="text-sm font-semibold leading-tight whitespace-nowrap">{cat.name}</p>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5 whitespace-nowrap">
          Explore
        </p>
      </div>
    </Link>
  );
}

function MarqueeRow({ items, direction, speed, paused }: { items: any[]; direction: "left" | "right"; speed: number; paused: boolean }) {
  const loop = [...items, ...items];

  return (
    <div className="flex overflow-hidden">
      <div
        className="flex gap-4 pr-4"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {loop.map((cat: any, i: number) => {
          const slugKey = (cat.slug || cat.name || "").toLowerCase();
          const Icon = iconMap[slugKey] || Layers;
          const style = catStyles[slugKey] || defaultStyle;
          return <CatCard key={`${direction}-${i}`} cat={cat} slugKey={slugKey} Icon={Icon} style={style} />;
        })}
      </div>
    </div>
  );
}

export function CategoryBrowser() {
  const [paused, setPaused] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-landing"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const display = categories && categories.length > 0 ? categories : fallbackCategories;

  return (
    <section id="categories" className="py-24 overflow-hidden relative bg-muted/30">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="container px-4 mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Browse by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Find the perfect creator for any type of project.
          </p>
        </motion.div>
      </div>

      {/* Marquee area — CSS mask creates edge fade */}
      <div
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Row 1 scrolls left */}
        <div className="mb-4">
          <MarqueeRow items={display} direction="left" speed={28} paused={paused} />
        </div>

        {/* Row 2 scrolls right */}
        <MarqueeRow items={display} direction="right" speed={35} paused={paused} />
      </div>
    </section>
  );
}
