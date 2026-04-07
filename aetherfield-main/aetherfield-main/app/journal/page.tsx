import { Hero } from "../../components/journal/hero";
import { CallToAction } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Articles } from "@/components/journal/articles";



export default function Journal() {
    return (
        <>
            <Hero />
            <Articles />
            <CallToAction
                heading="Subscribe to Aetherfield Journal"
                buttonTitle="Sign up to newsletter"
            />
            <Footer />
        </>
    )
}