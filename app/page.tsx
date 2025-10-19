import { LandingHeader } from "@/components/landing-header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { CTASection } from "@/components/cta-section"
import { LandingFooter } from "@/components/landing-footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <LandingFooter />
    </main>
  )
}
