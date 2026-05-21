import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePaystack } from "@/hooks/usePaystack";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, RefreshCw, Check, MapPin } from "lucide-react";

export default function VybDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openPayment } = usePaystack();
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [ordering, setOrdering] = useState(false);

  const { data: vyb, isLoading } = useQuery({
    queryKey: ["vyb", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vybs")
        .select(`*, profiles!vybs_creator_id_fkey(id, display_name, avatar_url, username, location, creator_level, avg_rating, response_time, bio), vyb_tiers(*), categories(name), vyb_media(*)`)
        .eq("id", id!)
        .single();
      return data;
    },
  });

  const createOrderAfterPayment = async (paymentReference: string) => {
    if (!profile || !selectedTier || !vyb) return;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + selectedTier.delivery_days);
    const { error } = await supabase.from("orders").insert({
      client_id: profile.id,
      creator_id: (vyb as any).profiles.id,
      vyb_id: vyb.id,
      tier_id: selectedTier.id,
      amount: selectedTier.price,
      requirements,
      delivery_date: deliveryDate.toISOString(),
      status: "pending",
      payment_reference: paymentReference,
      payment_status: "success",
    });
    if (error) {
      toast({ title: "Payment received but order failed", description: "Contact support with reference: " + paymentReference, variant: "destructive" });
      return;
    }
    toast({ title: "Vyb booked!", description: "Payment confirmed. Your order is placed." });
    setShowOrderDialog(false);
    navigate("/dashboard/client");
  };

  const handleOrder = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!profile || !selectedTier || !vyb) return;

    setOrdering(true);
    const ref = `vybrr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    openPayment({
      email: user.email!,
      amount: Math.round(Number(selectedTier.price) * 100),
      ref,
      metadata: { vyb_id: vyb.id, tier_id: selectedTier.id, client_id: profile.id },
      onSuccess: async (reference) => {
        await createOrderAfterPayment(reference);
        setOrdering(false);
      },
      onClose: () => {
        setOrdering(false);
        toast({ title: "Payment cancelled", description: "No charge was made.", variant: "destructive" });
      },
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24"><div className="animate-pulse h-8 w-64 bg-muted rounded" /></div>
    </div>
  );

  if (!vyb) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 text-center">
        <h1 className="text-2xl font-heading font-bold">Vyb not found</h1>
      </div>
    </div>
  );

  const creator = (vyb as any).profiles;
  const tiers = (vyb as any).vyb_tiers || [];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={vyb.title} description={vyb.description || `Book ${vyb.title} on Vybrr.`} />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <Badge variant="secondary" className="mb-3">{(vyb as any).categories?.name}</Badge>
              <h1 className="text-3xl font-heading font-bold mb-4">{vyb.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{vyb.description}</p>
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={14} /> {vyb.delivery_time} days delivery</span>
              <span className="flex items-center gap-1"><RefreshCw size={14} /> {vyb.revision_count} revisions</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-accent" /> {vyb.avg_rating || "New"}</span>
            </div>

            {/* Pricing Tiers */}
            <div>
              <h2 className="text-xl font-heading font-bold mb-4">Choose a package</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tiers.sort((a: any, b: any) => Number(a.price) - Number(b.price)).map((tier: any) => (
                  <button
                    key={tier.id}
                    onClick={() => { setSelectedTier(tier); setShowOrderDialog(true); }}
                    className={`glass-card p-5 text-left transition-all hover:border-primary/50 ${selectedTier?.id === tier.id ? "border-primary" : ""}`}
                  >
                    <h3 className="font-heading font-semibold mb-1">{tier.name}</h3>
                    <div className="text-2xl font-heading font-bold text-primary mb-2">₦{Number(tier.price).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mb-3">{tier.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock size={12} /> {tier.delivery_days} days</div>
                      <div className="flex items-center gap-1"><RefreshCw size={12} /> {tier.revision_count} revisions</div>
                    </div>
                    {tier.features?.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {tier.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-1 text-xs"><Check size={12} className="text-primary" /> {f}</li>
                        ))}
                      </ul>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Creator sidebar */}
          <div className="glass-card p-6 h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={creator?.avatar_url || `https://ui-avatars.com/api/?name=${creator?.display_name}&background=7c5cfc&color=fff`}
                alt=""
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <Link to={`/creator/${creator?.username}`} className="font-heading font-semibold hover:text-primary transition-colors">
                  {creator?.display_name}
                </Link>
                <Badge className="ml-2 bg-accent/10 text-accent border-accent/30 text-[10px]">{creator?.creator_level}</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {creator?.location && <span className="flex items-center gap-0.5"><MapPin size={10} /> {creator.location}</span>}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{creator?.bio}</p>
            <div className="grid grid-cols-2 gap-3 text-center text-xs mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="font-heading font-semibold">{creator?.avg_rating || "N/A"}</div>
                <div className="text-muted-foreground">Rating</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="font-heading font-semibold">{creator?.response_time}</div>
                <div className="text-muted-foreground">Response</div>
              </div>
            </div>
            <Button className="w-full" onClick={() => { if (tiers[0]) { setSelectedTier(tiers[0]); setShowOrderDialog(true); } }}>
              Book this Vyb
            </Button>
          </div>
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book this Vyb</DialogTitle>
            <DialogDescription>
              {selectedTier?.name} package for ₦{Number(selectedTier?.price || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Share your brief</label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe what you need..."
                rows={4}
              />
            </div>
            <Button onClick={handleOrder} disabled={ordering} className="w-full">
              {ordering ? "Placing order..." : `Confirm booking (₦${Number(selectedTier?.price || 0).toLocaleString()})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
