'use client';
import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Square } from "lucide-react";
import { useRouter } from "next/navigation";

export function Hero() {
    const router = useRouter();
    return (
        <main className="flex flex-col desktop:flex-row items-center gap-8 tablet:gap-20 desktop:gap-16">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="relative h-80 tablet:h-120 desktop:h-200 w-full desktop:max-w-158">
                <Image src="/about/hero.png" fill alt="About hero" className="object-cover" />
            </motion.div>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="px-5 tablet:px-35 desktop:px-0 desktop:pl-16">
                <h1 className="paragraph-2 text-paragraph-2">Our mission</h1>
                <p className="mt-4 header-4">Climate action starts with better information. We help organizations turn complex data into measurable, meaningful change.</p>
                <Button
                    className="mt-8 tablet:mt-14 w-full tablet:w-auto"
                    onClick={() => router.push("/")}
                >
                    <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                    Meet the team
                </Button>
            </motion.div>
        </main>
    )
}