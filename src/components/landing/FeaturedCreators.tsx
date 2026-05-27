import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackCreators = [
  { id: null, username: null, display_name: "Chioma Okafor", avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&crop=face", specialty: "Brand Identity", avg_rating: 4.9, startingAt: 45000, creator_level: "pro", skills: ["Brand Identity", "Logo Design"] },
  { id: null, username: null, display_name: "Marcus Webb", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face", specialty: "Motion Graphics", avg_rating: 5.0, startingAt: 80000, creator_level: "expert", skills: ["Motion Graphics", "After Effects"] },
  { id: null, username: null, display_name: "Adaeze Nwankwo", avatar_url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=500&fit=crop&crop=face", specialty: "Music Production", avg_rating: 4.8, startingAt: 30000, creator_level: "pro", skills: ["Music Production", "Mixing"] },
  { id: null, username: null, display_name: "Tunde Bakare", avatar_url: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=500&fit=crop&crop=face", specialty: "Video Editing", avg_rating: 4.9, startingAt: 55000, creator_level: "expert", skills: ["Video Editing", "Color Grading"] },
  { id: null, username: null, display_name: "Luna Park", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face", specialty: "UI/UX Design", avg_rating: 4.7, startingAt: 60000, creator_level: "pro", skills: ["UI/UX", "Figma"] },
  { id: null, username: null, display_name: "Emeka Eze", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face", specialty: "Web Development", avg_rating: 5.0, startingAt: 100000, creator_level: "expert", skills: ["React", "Node.js"] },
  { id: null, username: null, display_name: "Fatima Bello", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face", specialty: "Content Writing", avg_rating: 4.8, startingAt: 20000, creator_level: "rising", skills: ["Copywriting", "SEO"] },
  { id: null, username: null, display_name: "Aria Chen", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face", specialty: "Photography", avg_rating: 4.9, startingAt: 75000, creator_level: "pro", skills: ["Photography", "Retouching"] },
];

const levelConfig: Record<string, { label: string; badge: string; border: string; glow: string }> = {
  expert: {
    label: "Expert",
    badge: "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 font-bold",
    border: "border-amber-500/20 hover:border-amber-400/50",
    glow: "hover:shadow-amber-500/20",
  },
  pro: {
    label: "Pro",
    badge: "bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold",
    border: "border-violet-500/20 hover:border-violet-400/50",
    glow: "hover:shadow-violet-500/20",
  },
  rising: {
    label: "Rising",
    badge: "bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-900 font-bold",
    border: "border-emerald-500/20 hover:border-emerald-400/50",
    glow: "hover:shadow-emerald-500/20",
  },
};

const defaultLevel = {
  label: "Creator",
  badge: "bg-muted text-muted-foreground font-medium",
  border: "border-border hover:border-primary/30",
  glow: "hover:shadow-primary/10",
};

function CreatorCard({ creator, index }: { creator: any; index: number }) {
  const level = levelConfig[creator.creator_level] || defaultLevel;
  const skills: string[] = creator.skills?.slice(0, 2) || [];

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={[
        "group relative rounded-2xl overflow-hidden border bg-card flex flex-col cursor-pointer",
        "transition-all duration-300 hover:scale-[1.03] hover:shadow-xl",
        level.border, level.glow,
      ].join(" ")}
    >
      {/* Avatar banner */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img
          src={creator.avatar_url || `https://ui-avatars.com/api/?name=${creator.display_name}&background=7c5cfc&color=fff&size=400`}
          alt={creator.display_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />

        {/* Level badge */}
        <span className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full ${level.badge}`}>
          {level.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-heading font-bold text-sm leading-tight">{creator.display_name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{creator.specialty}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-accent text-accent" />
          <span className="text-xs font-semibold">{creator.avg_rating || "New"}</span>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.map((s: string) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
          <div>
            {creator.startingAt ? (
              <p className="text-xs text-muted-foreground">
                From <span className="font-heading font-semibold text-foreground">₦{creator.startingAt.toLocaleString()}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No Vybs yet</p>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Profile <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );

  return creator.username ? (
    <Link to={`/creator/${creator.username}`} key={creator.display_name}>{card}</Link>
  ) : (
    <div key={creator.display_name}>{card}</div>
  );
}

export function FeaturedCreators() {
  const { data: realCreators } = useQuery({
    queryKey: ["featured-creators"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, avg_rating, creator_level, skills")
        .in("role", ["creator", "both"])
        .eq("is_profile_complete", true)
        .order("avg_rating", { ascending: false })
        .limit(8);
      if (!data || data.length === 0) return null;

      const creatorIds = data.map((c) => c.id);
      const { data: vybs } = await supabase
        .from("vybs")
        .select("creator_id, vyb_tiers(price), categories(name)")
        .in("creator_id", creatorIds)
        .eq("is_published", true);

      return data.map((creator) => {
        const creatorVybs = (vybs || []).filter((v: any) => v.creator_id === creator.id);
        const allPrices = creatorVybs.flatMap((v: any) => (v.vyb_tiers || []).map((t: any) => Number(t.price)));
        const specialty = creatorVybs[0]?.categories?.name || (creator.skills?.[0] ?? "Creator");
        return { ...creator, startingAt: allPrices.length > 0 ? Math.min(...allPrices) : null, specialty };
      });
    },
  });

  const creators = realCreators || fallbackCreators;

  return (
    <section className="py-24 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Featured <span className="gradient-text">Creators</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Top-rated talent ready to bring your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {creators.map((creator: any, i: number) => (
            <CreatorCard key={creator.display_name} creator={creator} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild className="rounded-full px-8">
            <Link to="/explore">Browse all creators</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
