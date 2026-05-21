import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Upload, Paperclip, Download } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, vybs(title), profiles!orders_client_id_fkey(display_name, avatar_url), creator:profiles!orders_creator_id_fkey(display_name, avatar_url), vyb_tiers(name, price)`)
        .eq("id", id!)
        .single();
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["order-messages", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_messages")
        .select("*, profiles(display_name, avatar_url)")
        .eq("order_id", id!)
        .order("created_at", { ascending: true });
      return data || [];
    },
    refetchInterval: 5000,
  });

  const { data: deliverables } = useQuery({
    queryKey: ["order-deliverables", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_deliverables")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-messages-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_messages", filter: `order_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["order-messages", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  const sendMessage = async () => {
    if (!message.trim() || !profile) return;
    const { error } = await supabase.from("order_messages").insert({
      order_id: id!,
      sender_id: profile.id,
      content: message.trim(),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setMessage("");
  };

  const handleDeliveryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryFiles(Array.from(e.target.files || []));
  };

  const submitDelivery = async () => {
    if (!profile || !id) return;
    setSubmittingDelivery(true);
    try {
      const uploadedUrls: { file_name: string; file_url: string; file_size: number }[] = [];

      for (const file of deliveryFiles) {
        const path = `${id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("order-deliverables").upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("order-deliverables").getPublicUrl(path);
        uploadedUrls.push({ file_name: file.name, file_url: urlData.publicUrl, file_size: file.size });
      }

      for (const item of uploadedUrls) {
        await supabase.from("order_deliverables").insert({
          order_id: id,
          uploaded_by: profile.id,
          file_name: item.file_name,
          file_url: item.file_url,
          file_size: item.file_size,
          note: deliveryNote || null,
        });
      }

      // If no files, just add a note as a message
      if (uploadedUrls.length === 0 && deliveryNote) {
        await supabase.from("order_messages").insert({
          order_id: id,
          sender_id: profile.id,
          content: `[Delivery Note] ${deliveryNote}`,
        });
      }

      // Update order status to delivered
      await supabase.from("orders").update({ status: "delivered" }).eq("id", id);

      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["order-deliverables", id] });
      queryClient.invalidateQueries({ queryKey: ["order-messages", id] });
      queryClient.invalidateQueries({ queryKey: ["creator-orders", profile.id] });

      toast({ title: "Delivery submitted!", description: "The client has been notified." });
      setShowDeliveryDialog(false);
      setDeliveryFiles([]);
      setDeliveryNote("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const isCreator = order && profile && (order as any).creator_id === profile.id;

  if (!order) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 text-center"><div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={`Order: ${(order as any).vybs?.title || "Details"}`} />
      <Navbar />
      <div className="container pt-24 pb-16 px-4 max-w-3xl">
        {/* Order Info */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-heading font-bold">{(order as any).vybs?.title}</h1>
            <Badge>{order.status?.replace(/_/g, " ")}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Amount</span>
              <span className="font-heading font-semibold">₦{Number(order.amount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Package</span>
              <span className="font-heading font-semibold">{(order as any).vyb_tiers?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Due</span>
              <span className="font-heading font-semibold">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "TBD"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Order ID</span>
              <span className="font-mono text-xs">{order.id.slice(0, 8)}</span>
            </div>
          </div>
          {order.requirements && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground block mb-1">Brief</span>
              <p className="text-sm">{order.requirements}</p>
            </div>
          )}

          {/* Creator actions */}
          {isCreator && (order.status === "in_progress" || order.status === "revision_requested") && (
            <div className="mt-4">
              <Button onClick={() => setShowDeliveryDialog(true)}>
                <Upload size={14} className="mr-1" /> Submit Delivery
              </Button>
            </div>
          )}
        </div>

        {/* Deliverables */}
        {deliverables && deliverables.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <Paperclip size={14} /> Deliverables
            </h2>
            <div className="space-y-2">
              {deliverables.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{d.file_name}</p>
                    {d.note && <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>}
                    {d.file_size && <p className="text-xs text-muted-foreground">{(d.file_size / 1024 / 1024).toFixed(2)} MB</p>}
                  </div>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="glass-card flex flex-col" style={{ height: "400px" }}>
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-semibold text-sm">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages?.map((msg: any) => {
              const isMe = msg.sender_id === profile?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {!isMe && <span className="text-xs font-medium block mb-1">{msg.profiles?.display_name}</span>}
                    <p>{msg.content}</p>
                    <span className="text-[10px] opacity-70 mt-1 block">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button size="icon" onClick={sendMessage}><Send size={16} /></Button>
          </div>
        </div>
      </div>

      {/* Delivery submission dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Delivery</DialogTitle>
            <DialogDescription>Upload your work files and add a note for the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Files</label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload size={20} className="text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Click to select files</span>
                <input type="file" multiple className="hidden" onChange={handleDeliveryFilesChange} />
              </label>
              {deliveryFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {deliveryFiles.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex justify-between">
                      <span>{f.name}</span>
                      <span>{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Note to client</label>
              <Textarea value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} rows={3} placeholder="Describe what you've delivered..." />
            </div>
            <Button onClick={submitDelivery} disabled={submittingDelivery || (deliveryFiles.length === 0 && !deliveryNote)} className="w-full">
              {submittingDelivery ? "Submitting..." : "Submit Delivery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
