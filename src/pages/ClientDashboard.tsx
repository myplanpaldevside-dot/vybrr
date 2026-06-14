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
import { Clock, CheckCircle, AlertCircle, Package, Star, MessageCircle, ShoppingBag, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  delivered: "bg-accent/10 text-accent",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  revision_requested: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  cancelled: "bg-destructive/10 text-destructive",
  disputed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  delivered: "Delivered",
  completed: "Completed",
  revision_requested: "Revision",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const TAB_FILTERS = ["All", "Active", "Delivered", "Completed"];

export default function ClientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [cancelOrder, setCancelOrder] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["client-orders", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, vybs(title, creator_id), profiles!orders_creator_id_fkey(id, display_name, avatar_url, username), vyb_tiers(name)`)
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

  const filteredOrders = (orders || []).filter((o: any) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return ["pending", "in_progress", "revision_requested"].includes(o.status);
    if (activeTab === "Delivered") return o.status === "delivered";
    if (activeTab === "Completed") return o.status === "completed";
    return true;
  });

  const totalSpent = (orders || []).filter((o: any) => o.status === "completed").reduce((s: number, o: any) => s + Number(o.amount), 0);
  const activeCount = (orders || []).filter((o: any) => ["pending", "in_progress", "revision_requested", "delivered"].includes(o.status)).length;

  const confirmCancelOrder = async () => {
    if (!cancelOrder) return;
    setCancelling(true);
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", cancelOrder.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["client-orders", profile?.id] });
      toast({ title: "Order cancelled", description: "Contact support@vybrr.ng for refund queries." });
      setCancelOrder(null);
    }
    setCancelling(false);
  };

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
      toast({ title: "Revision requested", description: "The creator has been notified." });
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

        {/* Role switcher */}
        {profile?.role === "both" && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/dashboard/creator")}>Creator</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-background shadow-sm">Client</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track and manage your booked Vybs</p>
          </div>
          <Button asChild>
            <Link to="/explore">
              <ShoppingBag size={16} className="mr-1.5" /> Browse Vybs
            </Link>
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && orders && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
              <p className="text-2xl font-heading font-bold">{orders.length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="text-2xl font-heading font-bold text-primary">{activeCount}</p>
            </div>
            <div className="glass-card p-4 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="text-2xl font-heading font-bold">₦{totalSpent.toLocaleString()}</p>
            </div>
          </motion.div>
        )}

        {/* Tab filters */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {TAB_FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order: any, i: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${order.profiles?.display_name}&background=7c5cfc&color=fff&size=64`}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-heading font-semibold text-sm leading-tight">{order.vybs?.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {order.profiles?.display_name}
                        {order.vyb_tiers?.name && <> · <span className="font-medium">{order.vyb_tiers.name}</span></>}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={11} /> Due: {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "TBD"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                    <Badge className={statusColors[order.status] || ""}>{statusLabels[order.status] || order.status}</Badge>
                    <span className="font-heading font-bold text-sm">₦{Number(order.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Link to={`/order/${order.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1.5">
                      <MessageCircle size={14} /> Message Creator
                    </Button>
                  </Link>

                  {order.status === "pending" && (
                    <Button size="sm" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setCancelOrder(order)}>
                      <XCircle size={14} /> Cancel Order
                    </Button>
                  )}

                  {order.status === "delivered" && (
                    <>
                      <Button size="sm" onClick={() => markComplete(order)} className="gap-1.5">
                        <CheckCircle size={14} /> Mark Complete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => requestRevision(order.id)} className="gap-1.5">
                        <AlertCircle size={14} /> Request Revision
                      </Button>
                    </>
                  )}

                  {order.status === "completed" && !myReviews?.has(order.id) && (
                    <Button size="sm" variant="outline" onClick={() => { setReviewOrder(order); setRating(5); setComment(""); }} className="gap-1.5">
                      <Star size={14} /> Leave Review
                    </Button>
                  )}

                  {order.status === "completed" && myReviews?.has(order.id) && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} /> Review submitted
                    </span>
                  )}

                  <Link to={`/order/${order.id}`} className="text-xs text-primary hover:underline ml-auto">
                    View details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : orders && orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Browse Vybs and find the perfect creator for your project.</p>
            <Button asChild><Link to="/explore">Explore Vybs</Link></Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No {activeTab.toLowerCase()} orders found.</p>
            <button onClick={() => setActiveTab("All")} className="text-sm text-primary hover:underline mt-2 block mx-auto">
              Show all orders
            </button>
          </div>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancelOrder} onOpenChange={(open) => !open && setCancelOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              This will cancel your order for <strong>{cancelOrder?.vybs?.title}</strong>. For refund queries, contact <a href="mailto:support@vybrr.ng" className="text-primary underline">support@vybrr.ng</a>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={() => setCancelOrder(null)} className="flex-1">Keep Order</Button>
            <Button variant="destructive" onClick={confirmCancelOrder} disabled={cancelling} className="flex-1">
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <Star size={32} className={star <= rating ? "fill-accent text-accent" : "text-muted-foreground"} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Comment (optional)</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with others..." rows={3} />
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
