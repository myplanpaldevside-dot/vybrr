import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, AlertCircle, Package, Star } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  delivered: "bg-accent/10 text-accent",
  completed: "bg-green-100 text-green-700",
  revision_requested: "bg-orange-100 text-orange-700",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function ClientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["client-orders", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, vybs(title, creator_id), profiles!orders_creator_id_fkey(id, display_name, avatar_url), vyb_tiers(name)`)
        .eq("client_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: myReviews } = useQuery({
    queryKey: ["my-reviews", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("order_id").eq("client_id", profile!.id);
      return new Set((data || []).map((r: any) => r.order_id));
    },
  });

  const markComplete = async (order: any) => {
    const { error } = await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", order.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["client-orders", profile?.id] });
      setReviewOrder(order);
      setRating(5);
      setComment("");
    }
  };

  const requestRevision = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "revision_requested" }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["client-orders", profile?.id] });
    }
  };

  const submitReview = async () => {
    if (!profile || !reviewOrder) return;
    setSubmittingReview(true);
    try {
      const creatorId = reviewOrder.profiles?.id || reviewOrder.vybs?.creator_id;
      const { error } = await supabase.from("reviews").insert({
        order_id: reviewOrder.id,
        client_id: profile.id,
        creator_id: creatorId,
        vyb_id: reviewOrder.vyb_id,
        rating,
        comment,
      });
      if (error) throw error;

      // Update creator avg_rating
      const { data: allReviews } = await supabase.from("reviews").select("rating").eq("creator_id", creatorId);
      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length;
        await supabase.from("profiles").update({ avg_rating: Math.round(avg * 10) / 10 }).eq("id", creatorId);
      }

      queryClient.invalidateQueries({ queryKey: ["my-reviews", profile.id] });
      toast({ title: "Review submitted!", description: "Thanks for your feedback." });
      setReviewOrder(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="My Orders" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        {profile?.role === "both" && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/dashboard/creator")}>Creator</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-background shadow-sm">Client</button>
          </div>
        )}
        <h1 className="text-2xl font-heading font-bold mb-6">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${order.profiles?.display_name}`}
                      alt="" className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-heading font-semibold text-sm">{order.vybs?.title}</h3>
                      <p className="text-xs text-muted-foreground">by {order.profiles?.display_name} · {order.vyb_tiers?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[order.status] || ""}>{order.status?.replace("_", " ")}</Badge>
                    <span className="text-sm font-heading font-semibold">₦{Number(order.amount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> Due: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "TBD"}</span>
                </div>
                {order.status === "delivered" && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => markComplete(order)}>
                      <CheckCircle size={14} className="mr-1" /> Mark Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => requestRevision(order.id)}>
                      <AlertCircle size={14} className="mr-1" /> Request Revision
                    </Button>
                  </div>
                )}
                {order.status === "completed" && !myReviews?.has(order.id) && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { setReviewOrder(order); setRating(5); setComment(""); }}>
                    <Star size={14} className="mr-1" /> Leave a Review
                  </Button>
                )}
                <Link to={`/order/${order.id}`} className="text-xs text-primary hover:underline mt-2 inline-block">View details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-heading font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Browse Vybs and find the perfect creator</p>
            <Button asChild><Link to="/explore">Explore Vybs</Link></Button>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewOrder} onOpenChange={(open) => !open && setReviewOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>How was your experience with {reviewOrder?.profiles?.display_name}?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star size={28} className={star <= rating ? "fill-accent text-accent" : "text-muted-foreground"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Comment</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={3} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReviewOrder(null)} className="flex-1">Skip</Button>
              <Button onClick={submitReview} disabled={submittingReview} className="flex-1">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
