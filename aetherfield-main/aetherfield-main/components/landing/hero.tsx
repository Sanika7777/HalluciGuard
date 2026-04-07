'use client';
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import heroImage from '@/public/hero-image.png';
import { useRouter } from "next/navigation";



export function Hero() {
    const router = useRouter();
    return (
        <main className="flex flex-col items-center">
            <section className="px-5 -mt-16 pt-27 pb-38 tablet:pb-48 desktop:pb-90 bg-linear-(--background-3) w-full">
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                    viewport={{ once: true }}
                    className="">
                    <h1 className="tablet:pt-20 header-1 text-center">Sustainability insights,</h1>
                    <h1 className="header-2 text-center">built for business</h1>
                    <p className="text-center mt-4 paragraph-2">Track impact, reduce emissions, and accelerate progress-with clarity and confidence.</p>
                    <div className="flex flex-col tablet:flex-row mt-6 tablet:mt-8 gap-3 tablet:gap-4 justify-center items-center">
                        <Button onClick={() => router.push("/")}>
                            <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                            Request a demo
                        </Button>
                        <Button onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}>
                            <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                            Explore the platform
                        </Button>
                    </div>
                </motion.div>
            </section>
            <motion.figure
                initial={{ y: 50, scale: 0.5, opacity: 0 }}
                whileInView={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="mx-5 -mt-30 tablet:-mt-40 desktop:-mt-76">
                <Image preload={true} src={heroImage} fetchPriority={'high'} alt="Hero image" className="object-contain w-full" />
            </motion.figure>
        </main>
    )
}