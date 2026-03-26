"use client";

import HeroSection from "@/components/cms/homepage/HeroSection";
import FeaturedProjects from "@/components/cms/homepage/FeaturedProjects";
import AboutSection from "@/components/cms/homepage/AboutSection";
import StatsSection from "@/components/cms/homepage/StatsSection";
import CTASection from "@/components/cms/homepage/CTASection";

export default function HomepageCMS() {
  return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-semibold">Homepage CMS</h1>
          <p className="text-gray-400 text-sm">
            Manage homepage content dynamically
          </p>
        </div>

        <HeroSection />
        <FeaturedProjects />
        <AboutSection />
        <StatsSection />
        <CTASection />

      </div>
  );
}