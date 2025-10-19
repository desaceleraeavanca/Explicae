import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { PricingHero } from "@/components/pricing-hero"
import { PricingComparison } from "@/components/pricing-comparison"
import { PricingFAQ } from "@/components/pricing-faq"
import { PricingCTA } from "@/components/pricing-cta"

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <PricingHero />
      <PricingComparison />
      <PricingFAQ />
      <PricingCTA />
      <LandingFooter />
    </main>
  )
}
