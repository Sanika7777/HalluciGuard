'use client';
import { motion } from "motion/react";
import Image from "next/image";
import articleHeroImage from '@/public/articles/article-hero.png';

export function Hero() {
    return (
        <>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="pt-15 tablet:pt-20 pb-10 desktop:px-[125px] px-5 max-w-[1030px] mx-auto">
                <div className="flex gap-2 justify-center">
                    <span className="paragraph-2 text-paragraph-2">Insights</span>
                    <span className="paragraph-2 text-paragraph-2">&bull;</span>
                    <span className="paragraph-2 text-paragraph-2">4 min</span>
                </div>
                <h1 className="header-2 mt-4 text-center">How to Build a Climate-Ready Data Stack</h1>
            </motion.div>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="">
                <Image src={articleHeroImage} fetchPriority="high" preload alt="Article Hero" className="object-cover h-[135px] tablet:h-[306px] desktop:h-125 mx-5" />
            </motion.div>
        </>
    )
}