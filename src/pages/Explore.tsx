import { useState } from "react";
import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock } from "lucide-react";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  const { data: vybs, isLoading } = useQuery({
    queryKey: ["vybs", search, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("vybs")
        .select(`*, profiles!vybs_creator_id_fkey(display_name, avatar_url, username, creator_level, avg_rating), vyb_tiers(price), categories(name, slug)`)
        .eq("is_published", true);

      if (categoryFilter !== "all") {
        const cat = categories?.find((c) => c.slug === categoryFilter);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Explore Creators" description="Discover talented digital creators for your next project on Vybrr. Browse designers, editors, musicians, and more." />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Explore Vybs</h1>
          <p className="text-muted-foreground">Discover talented creators for your next project</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search for a designer, musician, video editor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : vybs && vybs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vybs.map((vyb: any) => {
              const minPrice = vyb.vyb_tiers?.length > 0 ? Math.min(...vyb.vyb_tiers.map((t: any) => Number(t.price))) : null;
              return (
                <Link to={`/vyb/${vyb.id}`} key={vyb.id} className="glass-card-hover overflow-hidden group">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl font-heading font-bold text-primary/30">{vyb.title?.charAt(0)}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={vyb.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${vyb.profiles?.display_name}&background=7c5cfc&color=fff`}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-muted-foreground">{vyb.profiles?.display_name}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-2">{vyb.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-accent text-accent" />
                        <span className="text-xs">{vyb.avg_rating || "New"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{vyb.delivery_time}d</span>
                      </div>
                    </div>
                    {minPrice && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">From </span>
                        <span className="text-sm font-heading font-semibold">₦{minPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-heading font-semibold mb-2">No Vybs found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button asChild><Link to="/explore">Browse all</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
