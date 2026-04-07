import { Footer } from "@/components/footer";
import { Hero } from "@/components/article/hero";
import { Body } from "@/components/article/body";
import { Related } from "@/components/article/related";

export default function Article() {
    return (
        <div>
            <Hero />
            <Body />
            <Related />
            <Footer />
        </div>
    )
}