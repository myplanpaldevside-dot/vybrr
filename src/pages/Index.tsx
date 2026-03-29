import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedCreators } from "@/components/landing/FeaturedCreators";
import { CategoryBrowser } from "@/components/landing/CategoryBrowser";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
