import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, LogOut, LayoutDashboard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import vybrrLogo from "@/assets/vybrr-logo.png";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = profile?.role === "client" ? "/dashboard/client" : "/dashboard/creator";

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
