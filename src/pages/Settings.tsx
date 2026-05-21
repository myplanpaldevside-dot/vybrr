import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

const SKILL_OPTIONS = ["UI/UX Design", "Graphic Design", "Video Editing", "Motion Graphics", "Music Production", "Songwriting", "Copywriting", "Content Writing", "Web Development", "Mobile Development", "Photography", "3D Animation", "Illustration", "Brand Identity", "Social Media"];

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name || "");
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setLocation(profile.location || "");
    setSkills((profile.skills as string[]) || []);
  }, [profile]);

  if (!profile) {
    navigate("/login");
    return null;
  }

  const toggleSkill = (skill: string) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatar_url = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${profile.user_id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("profiles").update({
        display_name: displayName,
        username: username || null,
        bio,
        location,
        skills,
        avatar_url,
      }).eq("id", profile.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Settings saved!", description: "Your profile has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = avatarPreview || profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name || "U"}&background=7c5cfc&color=fff&size=128`;

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Settings" />
      <Navbar />
      <div className="container pt-24 pb-16 px-4 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold mb-6">Profile Settings</h1>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="glass-card p-5">
            <h2 className="font-heading font-semibold mb-4">Profile Photo</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={currentAvatar} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Camera size={14} className="text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium">{profile.display_name}</p>
                <p className="text-xs text-muted-foreground">@{profile.username || "no username"}</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-heading font-semibold">Basic Info</h2>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/g, ""))} placeholder="username" className="pl-7" />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria" />
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-5">
            <h2 className="font-heading font-semibold mb-3">Skills</h2>
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
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !displayName} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
