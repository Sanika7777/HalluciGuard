'use client';
import { motion } from "motion/react";
import Image from "next/image";
import heroImage from '@/public/journal/hero.png'

export function Hero() {
    return (
        <motion.div
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
            viewport={{ once: true }}
        >
            <Image src={heroImage} alt="Journal hero image" className="w-full object-contain px-5" fetchPriority="high" preload />
        </motion.div>
    )
}