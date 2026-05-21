import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, LogOut, LayoutDashboard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import vybrrLogo from "@/assets/vybrr-logo.png";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", profile?.id],
    enabled: !!profile?.id,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const markAllRead = async () => {
    if (!profile || unreadCount === 0) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications", profile.id] });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = profile?.role === "client"
    ? "/dashboard/client"
    : profile?.role === "both"
    ? "/dashboard/creator"
    : "/dashboard/creator";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={vybrrLogo} alt="Vybrr" className="h-10" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
          <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="/#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Categories</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={dashboardPath}>
                  <LayoutDashboard size={16} className="mr-1" /> Dashboard
                </Link>
              </Button>

              {/* Notifications */}
              <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium">Notifications</p>
                  </div>
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n: any) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start gap-0.5 p-3 cursor-pointer ${!n.is_read ? "bg-primary/5" : ""}`}
                        onClick={() => n.link && navigate(n.link)}
                      >
                        <span className="text-sm font-medium">{n.title}</span>
                        {n.message && <span className="text-xs text-muted-foreground">{n.message}</span>}
                        <span className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleDateString()}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
                    <img
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name || "U"}&background=7c5cfc&color=fff&size=32`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{profile?.username || "user"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                    <LayoutDashboard size={14} className="mr-2" /> Dashboard
                  </DropdownMenuItem>
                  {profile?.username && (
                    <DropdownMenuItem onClick={() => navigate(`/creator/${profile.username}`)}>
                      <User size={14} className="mr-2" /> My Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <User size={14} className="mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut size={14} className="mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link to="/explore" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Explore</Link>
              <a href="/#how-it-works" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How it works</a>
              {user ? (
                <>
                  <Link to={dashboardPath} className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/settings" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Settings</Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="text-sm text-destructive text-left">Sign out</button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
                  <Button size="sm" asChild><Link to="/signup">Get Started</Link></Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
