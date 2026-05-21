import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Package, TrendingUp, Plus, Clock, Banknote, CheckCircle2, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  delivered: "bg-accent/10 text-accent",
  completed: "bg-green-100 text-green-700",
  revision_requested: "bg-orange-100 text-orange-700",
};

const withdrawalStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function CreatorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

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

  const { data: withdrawals } = useQuery({
    queryKey: ["withdrawals", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("creator_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const totalEarned = orders?.filter((o: any) => o.status === "completed").reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;
  const pendingEarnings = orders?.filter((o: any) => ["in_progress", "delivered", "pending"].includes(o.status)).reduce((sum: number, o: any) => sum + Number(o.amount), 0) || 0;
  const totalWithdrawn = withdrawals?.filter((w: any) => w.status === "completed").reduce((sum: number, w: any) => sum + Number(w.amount), 0) || 0;
  const availableBalance = totalEarned - totalWithdrawn;

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["creator-orders", profile?.id] });
    }
  };

  const submitWithdrawal = async () => {
    if (!profile) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (amount > availableBalance) {
      toast({ title: "Insufficient balance", description: `Available: ₦${availableBalance.toLocaleString()}`, variant: "destructive" });
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      toast({ title: "Please fill in all bank details", variant: "destructive" });
      return;
    }

    setWithdrawing(true);
    try {
      const { error } = await supabase.from("withdrawals").insert({
        creator_id: profile.id,
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        status: "pending",
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["withdrawals", profile.id] });
      toast({ title: "Withdrawal requested!", description: "We'll process your payment within 1–3 business days." });
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Creator Dashboard" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4">
        {profile?.role === "both" && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-background shadow-sm">Creator</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/dashboard/client")}>Client</button>
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-heading font-bold">Creator Dashboard</h1>
          <Button onClick={() => navigate("/dashboard/creator/vybs/new")}>
            <Plus size={16} className="mr-1" /> New Vyb
          </Button>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-accent mb-2"><DollarSign size={18} /> Total Earned</div>
            <div className="text-2xl font-heading font-bold">₦{totalEarned.toLocaleString()}</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-primary mb-2"><TrendingUp size={18} /> Pending</div>
            <div className="text-2xl font-heading font-bold">₦{pendingEarnings.toLocaleString()}</div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2"><Banknote size={18} /> Available</div>
            <div className="text-2xl font-heading font-bold">₦{availableBalance.toLocaleString()}</div>
            <Button size="sm" className="mt-3 w-full" variant="outline" onClick={() => setShowWithdrawDialog(true)} disabled={availableBalance <= 0}>
              Withdraw
            </Button>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2"><Package size={18} /> Active Vybs</div>
            <div className="text-2xl font-heading font-bold">{vybs?.filter((v: any) => v.is_published).length || 0}</div>
          </div>
        </div>

        {/* Orders */}
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
                    <Badge className={statusColors[order.status] || ""}>{order.status?.replace(/_/g, " ")}</Badge>
                    <span className="text-sm font-heading font-semibold">₦{Number(order.amount).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "in_progress")}>Accept Order</Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button size="sm" onClick={() => navigate(`/order/${order.id}`)}>Go to Order</Button>
                  )}
                  {order.status === "revision_requested" && (
                    <Button size="sm" onClick={() => navigate(`/order/${order.id}`)}>View Revision</Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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
          <div className="text-center py-10 mb-10">
            <p className="text-muted-foreground mb-4">You haven't created any Vybs yet</p>
            <Button onClick={() => navigate("/dashboard/creator/vybs/new")}><Plus size={16} className="mr-1" /> Create your first Vyb</Button>
          </div>
        )}

        {/* Withdrawal History */}
        {withdrawals && withdrawals.length > 0 && (
          <>
            <h2 className="text-lg font-heading font-bold mb-4">Withdrawal History</h2>
            <div className="space-y-3">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-sm">₦{Number(w.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{w.bank_name} · {w.account_number} · {w.account_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={withdrawalStatusColors[w.status] || ""}>{w.status}</Badge>
                    {w.status === "completed" && <CheckCircle2 size={16} className="text-green-600" />}
                    {w.status === "failed" && <AlertCircle size={16} className="text-red-500" />}
                    {w.status === "pending" && <Clock size={16} className="text-yellow-600" />}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Available balance: <span className="font-semibold text-foreground">₦{availableBalance.toLocaleString()}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={availableBalance}
              />
              <button
                type="button"
                className="text-xs text-primary hover:underline mt-1 block"
                onClick={() => setWithdrawAmount(String(availableBalance))}
              >
                Withdraw all (₦{availableBalance.toLocaleString()})
              </button>
            </div>
            <div>
              <Label>Bank Name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank, Access Bank" />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="10-digit account number" maxLength={10} />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Name on bank account" />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Withdrawals are processed within 1–3 business days. Minimum withdrawal is ₦1,000.
            </div>

            <Button onClick={submitWithdrawal} disabled={withdrawing || !withdrawAmount || !bankName || !accountNumber || !accountName} className="w-full">
              {withdrawing ? "Submitting..." : `Request ₦${Number(withdrawAmount || 0).toLocaleString()} withdrawal`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
