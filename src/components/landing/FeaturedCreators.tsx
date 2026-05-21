import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackCreators = [
  { id: null, username: null, display_name: "Chioma Okafor", avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face", specialty: "Brand Identity", avg_rating: 4.9, startingAt: 45000, creator_level: "pro" },
  { id: null, username: null, display_name: "Marcus Webb", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", specialty: "Motion Graphics", avg_rating: 5.0, startingAt: 80000, creator_level: "expert" },
  { id: null, username: null, display_name: "Adaeze Nwankwo", avatar_url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop&crop=face", specialty: "Music Production", avg_rating: 4.8, startingAt: 30000, creator_level: "pro" },
  { id: null, username: null, display_name: "Tunde Bakare", avatar_url: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=face", specialty: "Video Editing", avg_rating: 4.9, startingAt: 55000, creator_level: "expert" },
  { id: null, username: null, display_name: "Luna Park", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", specialty: "UI/UX Design", avg_rating: 4.7, startingAt: 60000, creator_level: "pro" },
  { id: null, username: null, display_name: "Emeka Eze", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", specialty: "Web Development", avg_rating: 5.0, startingAt: 100000, creator_level: "expert" },
  { id: null, username: null, display_name: "Fatima Bello", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", specialty: "Content Writing", avg_rating: 4.8, startingAt: 20000, creator_level: "rising" },
  { id: null, username: null, display_name: "Aria Chen", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", specialty: "Photography", avg_rating: 4.9, startingAt: 75000, creator_level: "pro" },
];

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

      // Get min price per creator
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
        return {
          ...creator,
          startingAt: allPrices.length > 0 ? Math.min(...allPrices) : null,
          specialty,
        };
      });
    },
  });

  const creators = realCreators || fallbackCreators;

  return (
    <section className="py-24 relative">
      <div className="container px-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator: any, i: number) => {
            const card = (
              <motion.div
                key={creator.display_name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-5 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={creator.avatar_url || `https://ui-avatars.com/api/?name=${creator.display_name}&background=7c5cfc&color=fff`}
                    alt={creator.display_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h3 className="font-heading font-semibold text-sm">{creator.display_name}</h3>
                    <p className="text-xs text-muted-foreground">{creator.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-accent text-accent" />
                    <span className="text-sm font-medium">{creator.avg_rating || "New"}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {creator.creator_level || "Rising"}
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  {creator.startingAt ? (
                    <>
                      <span className="text-xs text-muted-foreground">Starting at </span>
                      <span className="text-sm font-heading font-semibold">₦{creator.startingAt.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No Vybs yet</span>
                  )}
                </div>
              </motion.div>
            );

            return creator.username ? (
              <Link to={`/creator/${creator.username}`} key={creator.display_name}>{card}</Link>
            ) : (
              <div key={creator.display_name}>{card}</div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link to="/explore">Browse all creators</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
