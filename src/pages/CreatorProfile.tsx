import { useParams, Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, ShoppingBag } from "lucide-react";
import { VybCover } from "@/components/VybCover";

export default function CreatorProfile() {
  const { username } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["creator", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      return data;
    },
  });

  const { data: vybs } = useQuery({
    queryKey: ["creator-vybs", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("vybs")
        .select("*, vyb_tiers(price, name), categories(name)")
        .eq("creator_id", profile!.id)
        .eq("is_published", true);
      return data || [];
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["creator-reviews", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles!reviews_client_id_fkey(display_name, avatar_url)")
        .eq("creator_id", profile!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 text-center">
        <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 text-center">
        <h1 className="text-2xl font-heading font-bold">Creator not found</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={profile.display_name || "Creator"} description={profile.bio || `Check out ${profile.display_name}'s work on Vybrr.`} />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-12">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}&background=7c5cfc&color=fff&size=128`}
            alt={profile.display_name || ""}
            className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-heading font-bold">{profile.display_name}</h1>
              {profile.creator_level && (
                <Badge className="bg-accent/10 text-accent border-accent/30">{profile.creator_level}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-3">{profile.bio || "No bio yet"}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
              )}
              <span className="flex items-center gap-1"><Star size={14} className="text-accent" /> {profile.avg_rating || "No ratings"}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {profile.response_time}</span>
              <span className="flex items-center gap-1"><ShoppingBag size={14} /> {profile.total_orders} orders</span>
            </div>
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vybs Section */}
        <div className="mb-12">
          <h2 className="text-xl font-heading font-bold mb-6">Vybs by {profile.display_name}</h2>
          {vybs && vybs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vybs.map((vyb: any) => {
                const minPrice = vyb.vyb_tiers?.length > 0 ? Math.min(...vyb.vyb_tiers.map((t: any) => Number(t.price))) : null;
                return (
                  <Link to={`/vyb/${vyb.id}`} key={vyb.id} className="glass-card-hover overflow-hidden">
                    <VybCover category={vyb.categories?.slug} className="h-32" />
                    <div className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">{vyb.categories?.name}</Badge>
                      <h3 className="font-heading font-semibold mb-2">{vyb.title}</h3>
                      {minPrice && (
                        <span className="text-sm font-heading font-semibold">From ₦{minPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No Vybs listed yet.</p>
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="text-xl font-heading font-bold mb-6">Reviews</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${review.profiles?.display_name}`}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-sm">{review.profiles?.display_name}</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-accent text-accent" : "text-muted"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
