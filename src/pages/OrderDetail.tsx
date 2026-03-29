import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
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

  if (!order) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 text-center"><div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-16 px-4 max-w-3xl">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-heading font-bold">{(order as any).vybs?.title}</h1>
            <Badge>{order.status?.replace("_", " ")}</Badge>
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
        </div>

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
    </div>
  );
}
