import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedCreators } from "@/components/landing/FeaturedCreators";
import { CategoryBrowser } from "@/components/landing/CategoryBrowser";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";
import { PageMeta } from "@/components/PageMeta";

const Index = () => {
  return (
    <div className="min-h-screen">
      <PageMeta title="Vybrr" description="Hire world-class digital creators or showcase your work and get paid. Designers, editors, musicians, developers - all in one vibe on Vybrr." />
      <Navbar />
      <HeroSection />
      <FeaturedCreators />
      <CategoryBrowser />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
