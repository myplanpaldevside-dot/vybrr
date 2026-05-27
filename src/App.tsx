import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Explore from "./pages/Explore";
import CreatorProfile from "./pages/CreatorProfile";
import VybDetail from "./pages/VybDetail";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreateVyb from "./pages/CreateVyb";
import EditVyb from "./pages/EditVyb";
import Settings from "./pages/Settings";
import OrderDetail from "./pages/OrderDetail";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/creator/:username" element={<CreatorProfile />} />
              <Route path="/vyb/:id" element={<VybDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/creator" element={<CreatorDashboard />} />
              <Route path="/dashboard/creator/vybs/new" element={<CreateVyb />} />
              <Route path="/dashboard/creator/vybs/:id/edit" element={<EditVyb />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
