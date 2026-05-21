import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Trash2 } from "lucide-react";

export default function EditVyb() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [tiers, setTiers] = useState([
    { id: "", name: "Starter", price: "", description: "", delivery_days: "7", revision_count: "2", features: [] as string[] },
    { id: "", name: "Standard", price: "", description: "", delivery_days: "5", revision_count: "3", features: [] as string[] },
    { id: "", name: "Premium", price: "", description: "", delivery_days: "3", revision_count: "5", features: [] as string[] },
  ]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  const { data: vyb, isLoading } = useQuery({
    queryKey: ["vyb-edit", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("vybs")
        .select("*, vyb_tiers(*)")
        .eq("id", id!)
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (!vyb) return;
    setTitle(vyb.title || "");
    setCategoryId(vyb.category_id || "");
    setDescription(vyb.description || "");
    setTags((vyb.tags as string[]) || []);
    setIsPublished(vyb.is_published ?? true);

    const existing = (vyb as any).vyb_tiers || [];
    setTiers([
      { id: "", name: "Starter", price: "", description: "", delivery_days: "7", revision_count: "2", features: [] },
      { id: "", name: "Standard", price: "", description: "", delivery_days: "5", revision_count: "3", features: [] },
      { id: "", name: "Premium", price: "", description: "", delivery_days: "3", revision_count: "5", features: [] },
    ].map((defaultTier) => {
      const found = existing.find((t: any) => t.name === defaultTier.name);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          price: String(found.price || ""),
          description: found.description || "",
          delivery_days: String(found.delivery_days || defaultTier.delivery_days),
          revision_count: String(found.revision_count || defaultTier.revision_count),
          features: found.features || [],
        };
      }
      return defaultTier;
    }));
  }, [vyb]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const updateTier = (index: number, field: string, value: string) => {
    const updated = [...tiers];
    (updated[index] as any)[field] = value;
    setTiers(updated);
  };

  const handleSave = async (publish?: boolean) => {
    if (!profile || !id) return;
    setLoading(true);
    try {
      const publishState = publish !== undefined ? publish : isPublished;
      const { error: vybError } = await supabase
        .from("vybs")
        .update({
          category_id: categoryId || null,
          title,
          description,
          tags,
          delivery_time: parseInt(tiers[0].delivery_days) || 7,
          revision_count: parseInt(tiers[0].revision_count) || 2,
          is_published: publishState,
        })
        .eq("id", id);

      if (vybError) throw vybError;

      for (const tier of tiers) {
        if (!tier.price) continue;
        const tierData = {
          vyb_id: id,
          name: tier.name,
          price: parseFloat(tier.price),
          description: tier.description,
          delivery_days: parseInt(tier.delivery_days) || 7,
          revision_count: parseInt(tier.revision_count) || 2,
          features: tier.features,
        };
        if (tier.id) {
          await supabase.from("vyb_tiers").update(tierData).eq("id", tier.id);
        } else {
          await supabase.from("vyb_tiers").insert(tierData);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["my-vybs", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["vyb", id] });
      toast({ title: "Vyb updated!", description: "Your changes have been saved." });
      navigate("/dashboard/creator");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this Vyb? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await supabase.from("vyb_tiers").delete().eq("vyb_id", id);
      const { error } = await supabase.from("vybs").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["my-vybs", profile?.id] });
      toast({ title: "Vyb deleted" });
      navigate("/dashboard/creator");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24"><div className="animate-pulse h-8 w-64 bg-muted rounded" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Edit Vyb" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">Edit Vyb</h1>
            <p className="text-muted-foreground text-sm mt-1">Update your service listing</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} className="mr-1" /> {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-heading font-semibold">Basic Info</h2>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will design a stunning logo for your brand" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe your service in detail..." />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    {tag} <X size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-heading font-semibold">Pricing Tiers</h2>
            {tiers.map((tier, i) => (
              <div key={tier.name} className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-heading font-semibold text-sm">{tier.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price (₦)</Label>
                    <Input type="number" value={tier.price} onChange={(e) => updateTier(i, "price", e.target.value)} placeholder="5000" />
                  </div>
                  <div>
                    <Label>Delivery (days)</Label>
                    <Input type="number" value={tier.delivery_days} onChange={(e) => updateTier(i, "delivery_days", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={tier.description} onChange={(e) => updateTier(i, "description", e.target.value)} placeholder="What's included" />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard/creator")} className="flex-1">Cancel</Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={loading || !title} className="flex-1">
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={loading || !title || !tiers.some((t) => t.price)} className="flex-1">
              {loading ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
