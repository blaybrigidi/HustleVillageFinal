import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FeaturedServices } from "@/components/landing/FeaturedServices";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CategoryGrid />
      <FeaturedServices />
      <HowItWorks />
      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Index;
