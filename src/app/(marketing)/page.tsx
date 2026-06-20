import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Counter } from "@/components/marketing/counter";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";
import { RevealInit } from "@/components/marketing/reveal-init";

// Section order mirrors the standalone design HTML. Templates (display:none in
// the source) and the old Testimonials/Stories sections are intentionally not
// rendered — they aren't part of this design.
export default function LandingPage() {
  return (
    <div className="frame">
      <div className="page" id="page">
        <Nav />
        <Hero />
        <Counter />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
      <RevealInit />
    </div>
  );
}
