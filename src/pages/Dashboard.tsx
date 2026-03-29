import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate("/login");
      return;
    }
    if (!profile.is_profile_complete) {
      navigate("/onboarding");
      return;
    }
    if (profile.role === "client") {
      navigate("/dashboard/client");
    } else {
      navigate("/dashboard/creator");
    }
  }, [profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
