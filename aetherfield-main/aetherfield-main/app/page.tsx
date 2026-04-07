import { Header } from "@/components/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Values } from "@/components/landing/values";
import { CaseStudy } from "@/components/landing/caseStudy";
import { BlogSection } from "@/components/landing/blog";
import { Testimonial } from "@/components/landing/testimonial";
import { CallToAction } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <Features />
      <Values />
      <CaseStudy />
      <BlogSection />
      <Testimonial />
      <CallToAction heading="Ready to operationalize your sustainability goal?" buttonTitle="Request a demo" />
      <Footer />
    </div>
  );
}
