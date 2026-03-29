import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Briefcase, Sparkles } from "lucide-react";

const SKILL_OPTIONS = ["UI/UX Design", "Graphic Design", "Video Editing", "Motion Graphics", "Music Production", "Songwriting", "Copywriting", "Content Writing", "Web Development", "Mobile Development", "Photography", "3D Animation", "Illustration", "Brand Identity", "Social Media"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"creator" | "client" | "both" | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleSkill = (skill: string) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleComplete = async () => {
    if (!user || !role) return;
    setLoading(true);
    try {
      let avatar_url = null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("profiles").update({
        role,
        username: username || null,
        bio,
        location,
        skills,
        avatar_url,
        is_profile_complete: true,
      }).eq("user_id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile complete!" });
      navigate(role === "client" ? "/explore" : "/dashboard/creator");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold">Set up your profile</h1>
          <p className="text-muted-foreground mt-2">Step {step} of 3</p>
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-12 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-semibold text-center">How will you use Vybrr?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "creator" as const, icon: Paintbrush, label: "Creator", desc: "Showcase work and get hired" },
                { value: "client" as const, icon: Briefcase, label: "Client", desc: "Find and hire creators" },
                { value: "both" as const, icon: Sparkles, label: "Both", desc: "Create and hire" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${role === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <option.icon className="mx-auto mb-3 text-primary" size={28} />
                  <h3 className="font-heading font-semibold">{option.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)} disabled={!role} className="w-full">Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Profile photo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={3} />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-semibold text-center">What are your skills?</h2>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <Badge
                  key={skill}
                  variant={skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleComplete} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
