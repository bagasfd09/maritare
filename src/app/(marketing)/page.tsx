import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";
import { RevealInit } from "@/components/marketing/reveal-init";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";
import { MobileLanding } from "@/components/marketing/mobile-landing";

// Two layouts, toggled purely by CSS at the 768px breakpoint (see the
// `.mx-desktop` / `.mx-mobile` rules in globals.css): the desktop tree mirrors
// "Maritare Landing v2", the mobile tree mirrors "Maritare Mobile". Rendering
// both (one hidden) keeps each a faithful 1:1 port and avoids a hydration flash.
// Section order: Nav → Hero → Features → Pricing → Faq → FinalCta → Footer.
export default function LandingPage() {
  return (
    <>
      <div className="mx-desktop">
        <div className="frame">
          <div className="page" id="page">
            <Nav />
            <Hero />
            <Features />
            <Pricing />
            <Faq />
            <FinalCta />
            <Footer />
          </div>
        </div>
      </div>

      <div className="mx-mobile">
        <MobileLanding />
      </div>

      <RevealInit />
      <SmoothScroll />
    </>
  );
}
