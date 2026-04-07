import { Footer } from "@/components/footer";
import { Hero } from "@/components/about/hero";
import { Values } from "@/components/about/values";
import { Founder } from "@/components/about/founder";
import { Team } from "@/components/about/team";
import { CtaAbout } from "@/components/about/cta";



export default function About() {
    return (
        <div className="-mt-16">
            <Hero />
            <Values />
            <Founder />
            <Team />
            <CtaAbout />
            <Footer />
        </div>
    )
}