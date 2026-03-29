import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Package, TrendingUp, Plus, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  delivered: "bg-accent/10 text-accent",
  completed: "bg-green-100 text-green-700",
  revision_requested: "bg-orange-100 text-orange-700",
};

export default function CreatorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ["creator-orders", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, vybs(title), profiles!orders_client_id_fkey(display_name, avatar_url), vyb_tiers(name)`)
        .eq("creator_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: vybs } = useQuery({
    queryKey: ["my-vybs", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("vybs")
        .select("*, vyb_tiers(price), categories(name)")
        .eq("creator_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const totalEarned = orders?.filter((o: any) => o.status === "completed").reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;
  const pendingEarnings = orders?.filter((o: any) => ["in_progress", "delivered", "pending"].includes(o.status)).reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-heading font-bold">Creator Dashboard</h1>
          <Button onClick={() => navigate("/dashboard/creator/vybs/new")}>
            <Plus size={16} className="mr-1" /> New Vyb
          </Button>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-accent mb-2"><DollarSign size={18} /> Total Earned</div>
            <div className="text-2xl font-heading font-bold">₦{totalEarned.toLocaleString()}</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-primary mb-2"><TrendingUp size={18} /> Pending</div>
            <div className="text-2xl font-heading font-bold">₦{pendingEarnings.toLocaleString()}</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2"><Package size={18} /> Active Vybs</div>
            <div className="text-2xl font-heading font-bold">{vybs?.filter((v: any) => v.is_published).length || 0}</div>
          </div>
        </div>

        {/* Active Orders */}
        <h2 className="text-lg font-heading font-bold mb-4">Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-4 mb-10">
            {orders.map((order: any) => (
              <div key={order.id} className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={order.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${order.profiles?.display_name}`} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <h3 className="font-heading font-semibold text-sm">{order.vybs?.title}</h3>
                      <p className="text-xs text-muted-foreground">from {order.profiles?.display_name} · {order.vyb_tiers?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[order.status] || ""}>{order.status?.replace("_", " ")}</Badge>
                    <span className="text-sm font-heading font-semibold">₦{Number(order.amount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "in_progress")}>Accept Order</Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "delivered")}>Submit Delivery</Button>
                  )}
                  {order.status === "revision_requested" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "delivered")}>Resubmit</Button>
                  )}
                  <Link to={`/order/${order.id}`} className="text-xs text-primary hover:underline">View details</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-10">No orders yet.</p>
        )}

        {/* My Vybs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold">My Vybs</h2>
        </div>
        {vybs && vybs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vybs.map((vyb: any) => (
              <div key={vyb.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-semibold text-sm">{vyb.title}</h3>
                  <Badge variant={vyb.is_published ? "default" : "secondary"}>{vyb.is_published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{(vyb as any).categories?.name}</p>
                {vyb.vyb_tiers?.length > 0 && (
                  <p className="text-sm font-heading font-semibold">From ₦{Math.min(...vyb.vyb_tiers.map((t: any) => Number(t.price))).toLocaleString()}</p>
                )}
                <Link to={`/dashboard/creator/vybs/${vyb.id}/edit`} className="text-xs text-primary hover:underline mt-2 inline-block">Edit</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">You haven't created any Vybs yet</p>
            <Button onClick={() => navigate("/dashboard/creator/vybs/new")}><Plus size={16} className="mr-1" /> Create your first Vyb</Button>
          </div>
        )}
      </div>
    </div>
  );
}
