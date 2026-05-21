import { useState, FormEvent } from "react";
import { PageMeta } from "@/components/PageMeta";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthOrbitBackground } from "@/components/AuthOrbitBackground";
import vybrrLogo from "@/assets/vybrr-logo.png";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.4 9.54c-.02-2.07 1.69-3.07 1.77-3.12-1.02-1.44-2.55-1.62-3.09-1.63-1.3-.13-2.54.75-3.21.75-.66 0-1.69-.74-2.78-.72-1.42.02-2.74.83-3.47 2.09C2.2 9.33 3.2 13.18 4.7 15.28c.75 1.06 1.63 2.25 2.8 2.21 1.12-.04 1.55-.7 2.9-.7 1.35 0 1.74.7 2.92.68 1.2-.02 1.97-1.07 2.71-2.14.86-1.22 1.21-2.41 1.22-2.47-.03-.01-2.34-.88-2.35-3.32zM12.14 3.3c.59-.73.99-1.74.88-2.75-.85.04-1.9.58-2.51 1.3-.55.63-1.04 1.64-.91 2.61.95.07 1.94-.47 2.54-1.16z"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setOauthLoading(null);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/settings`,
      });
      if (error) throw error;
      toast({ title: "Reset link sent!", description: "Check your email for a password reset link." });
      setShowReset(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <PageMeta title="Log In" />
      <AuthOrbitBackground />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/">
            <img src={vybrrLogo} alt="Vybrr" className="h-10 mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-heading font-bold">
            {showReset ? "Reset password" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {showReset ? "Enter your email and we'll send you a reset link" : "Sign in to your Vybrr account"}
          </p>
        </div>

        {showReset ? (
          <form onSubmit={handleReset} className="space-y-4 glass-card p-6">
            <div>
              <Label htmlFor="resetEmail">Email</Label>
              <Input id="resetEmail" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send reset link"}
            </Button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to sign in
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
              >
                <GoogleIcon />
                {oauthLoading === "google" ? "..." : "Google"}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleOAuth("apple")}
                disabled={!!oauthLoading}
              >
                <AppleIcon />
                {oauthLoading === "apple" ? "..." : "Apple"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => { setResetEmail(email); setShowReset(true); }} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
