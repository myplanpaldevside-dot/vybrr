import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, SlidersHorizontal } from "lucide-react";
import { VybCover } from "@/components/VybCover";
import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    if (val === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: val });
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
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
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const sorted = [...(vybs || [])].sort((a: any, b: any) => {
    const minPriceA = a.vyb_tiers?.length ? Math.min(...a.vyb_tiers.map((t: any) => Number(t.price))) : 0;
    const minPriceB = b.vyb_tiers?.length ? Math.min(...b.vyb_tiers.map((t: any) => Number(t.price))) : 0;
    if (sort === "price_asc") return minPriceA - minPriceB;
    if (sort === "price_desc") return minPriceB - minPriceA;
    if (sort === "rating") return (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const allPills = [{ id: "all", name: "All", slug: "all" }, ...(categories || [])];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Explore Creators" description="Discover talented digital creators for your next project on Vybrr. Browse designers, editors, musicians, and more." />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold mb-1">Explore Vybs</h1>
          <p className="text-muted-foreground">Discover talented creators for your next project</p>
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search designers, musicians, video editors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-52 gap-2">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 flex-wrap mb-8"
        >
          {allPills.map((cat: any) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                categoryFilter === cat.slug
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-5">
            {sorted.length} {sorted.length === 1 ? "Vyb" : "Vybs"} found
            {search && <> for <span className="text-foreground font-medium">"{search}"</span></>}
            {categoryFilter !== "all" && <> in <span className="text-foreground font-medium capitalize">{categoryFilter}</span></>}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse" style={{ height: 280 }} />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((vyb: any, i: number) => {
              const minPrice = vyb.vyb_tiers?.length > 0 ? Math.min(...vyb.vyb_tiers.map((t: any) => Number(t.price))) : null;
              return (
                <motion.div
                  key={vyb.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                >
                  <Link to={`/vyb/${vyb.id}`} className="glass-card-hover overflow-hidden group block h-full">
                    <VybCover category={vyb.categories?.slug} className="h-40" />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={vyb.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${vyb.profiles?.display_name}&background=7c5cfc&color=fff`}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-muted-foreground truncate">{vyb.profiles?.display_name}</span>
                        {vyb.profiles?.creator_level && vyb.profiles.creator_level !== "rising" && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize ml-auto shrink-0">
                            {vyb.profiles.creator_level}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-3">{vyb.title}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-accent text-accent" />
                          <span>{vyb.profiles?.avg_rating || "New"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>{vyb.delivery_time}d delivery</span>
                        </div>
                      </div>
                      {minPrice && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">From </span>
                          <span className="text-sm font-heading font-bold">₦{minPrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">No Vybs found</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              {search ? `No results for "${search}". Try a different keyword.` : "No Vybs in this category yet. Check back soon."}
            </p>
            <Button variant="outline" onClick={() => { setSearchInput(""); setSearch(""); handleCategoryChange("all"); }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
