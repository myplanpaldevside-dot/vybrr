import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { useQuery } from "@tanstack/react-query";
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
import { X } from "lucide-react";

export default function CreateVyb() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  // Step 2
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  // Step 3
  const [tiers, setTiers] = useState([
    { name: "Starter", price: "", description: "", delivery_days: "7", revision_count: "2", features: [] as string[] },
    { name: "Standard", price: "", description: "", delivery_days: "5", revision_count: "3", features: [] as string[] },
    { name: "Premium", price: "", description: "", delivery_days: "3", revision_count: "5", features: [] as string[] },
  ]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

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

  const handlePublish = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data: vyb, error: vybError } = await supabase
        .from("vybs")
        .insert({
          creator_id: profile.id,
          category_id: categoryId || null,
          title,
          description,
          tags,
          delivery_time: parseInt(tiers[0].delivery_days) || 7,
          revision_count: parseInt(tiers[0].revision_count) || 2,
          is_published: true,
        })
        .select()
        .single();

      if (vybError) throw vybError;

      const tierData = tiers.filter((t) => t.price).map((t) => ({
        vyb_id: vyb.id,
        name: t.name,
        price: parseFloat(t.price),
        description: t.description,
        delivery_days: parseInt(t.delivery_days) || 7,
        revision_count: parseInt(t.revision_count) || 2,
        features: t.features,
      }));

      if (tierData.length > 0) {
        const { error: tierError } = await supabase.from("vyb_tiers").insert(tierData);
        if (tierError) throw tierError;
      }

      toast({ title: "Vyb published!", description: "Your Vyb is now live on Vybrr." });
      navigate("/dashboard/creator");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Create a Vyb" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold mb-2">Create a Vyb</h1>
        <p className="text-muted-foreground mb-6">Step {step} of 3</p>
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
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
            <Button onClick={() => setStep(2)} disabled={!title}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe your service in detail..." />
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-heading font-semibold">Pricing Tiers</h2>
            {tiers.map((tier, i) => (
              <div key={tier.name} className="glass-card p-4 space-y-3">
                <h3 className="font-heading font-semibold">{tier.name}</h3>
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handlePublish} disabled={loading || !tiers.some((t) => t.price)}>
                {loading ? "Publishing..." : "Publish Vyb"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
