import { Link } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Package } from "lucide-react";

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

  const { data: orders, isLoading } = useQuery({
    queryKey: ["client-orders", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, vybs(title), profiles!orders_creator_id_fkey(display_name, avatar_url), vyb_tiers(name)`)
        .eq("client_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const markComplete = async (orderId: string) => {
    await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", orderId);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="My Orders" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
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
                    <Button size="sm" onClick={() => markComplete(order.id)}>
                      <CheckCircle size={14} className="mr-1" /> Mark Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => supabase.from("orders").update({ status: "revision_requested" }).eq("id", order.id)}>
                      <AlertCircle size={14} className="mr-1" /> Request Revision
                    </Button>
                  </div>
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
    </div>
  );
}
