import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="pt-20 md:pt-24">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}