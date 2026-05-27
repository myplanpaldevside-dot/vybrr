import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Briefcase, Sparkles, Camera, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VybrrLogo } from "@/components/VybrrLogo";

const SKILL_OPTIONS = [
  "UI/UX Design", "Graphic Design", "Video Editing", "Motion Graphics",
  "Music Production", "Songwriting", "Copywriting", "Content Writing",
  "Web Development", "Mobile Development", "Photography", "3D Animation",
  "Illustration", "Brand Identity", "Social Media",
];

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<"creator" | "client" | "both" | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleSkill = (skill: string) => {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

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
      toast({ title: "You're all set!", description: "Welcome to Vybrr." });
      navigate(role === "client" ? "/explore" : "/dashboard/creator");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <VybrrLogo className="justify-center mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-heading font-bold">Set up your profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Step {step} of 3 — just a few quick things</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-heading font-semibold">How will you use Vybrr?</h2>
                  <p className="text-sm text-muted-foreground mt-1">You can always change this later in Settings.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: "creator" as const, icon: Paintbrush, label: "Creator", desc: "Showcase your work and get hired" },
                    { value: "client" as const, icon: Briefcase, label: "Client", desc: "Find and hire talented creators" },
                    { value: "both" as const, icon: Sparkles, label: "Both", desc: "Create services and hire others" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRole(option.value)}
                      className={`p-6 rounded-xl border-2 text-center transition-all relative ${role === option.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      {role === option.value && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </span>
                      )}
                      <option.icon className="mx-auto mb-3 text-primary" size={28} />
                      <h3 className="font-heading font-semibold text-sm">{option.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={goNext} disabled={!role} className="w-full gap-2">
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 glass-card p-6">
                <div className="text-center mb-2">
                  <h2 className="text-lg font-heading font-semibold">Tell us about yourself</h2>
                  <p className="text-sm text-muted-foreground mt-1">This will appear on your public profile.</p>
                </div>

                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={24} className="text-muted-foreground" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera size={14} className="text-primary-foreground" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground">Profile photo (optional)</span>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/g, "").toLowerCase())}
                      placeholder="yourhandle"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us what you do..." rows={3} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria" className="mt-1" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={goBack} className="flex-1 gap-2">
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button onClick={goNext} className="flex-1 gap-2">
                    Continue <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-lg font-heading font-semibold">What are your skills?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select all that apply. Clients will use these to find you.</p>
                </div>
                <div className="glass-card p-5 flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer select-none transition-all"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skills.includes(skill) && <Check size={11} className="mr-1" />}
                      {skill}
                    </Badge>
                  ))}
                </div>
                {skills.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">{skills.length} skill{skills.length !== 1 ? "s" : ""} selected</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={goBack} className="flex-1 gap-2">
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button onClick={handleComplete} disabled={loading} className="flex-1 gap-2">
                    {loading ? "Saving…" : "Complete Setup"}
                    {!loading && <Check size={16} />}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
