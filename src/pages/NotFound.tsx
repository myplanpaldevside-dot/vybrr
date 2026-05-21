import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex flex-col items-center justify-center min-h-screen px-4 text-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <div className="relative mb-8">
            <div className="text-[10rem] font-heading font-extrabold leading-none text-muted/30 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Search size={40} className="text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-heading font-bold mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            This page doesn't exist or may have been moved. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home size={16} className="mr-2" /> Go home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/explore">
                <Search size={16} className="mr-2" /> Explore Vybs
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft size={16} className="mr-2" /> Go back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
