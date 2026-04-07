'use client';
import { motion } from "motion/react";
import { values, Container } from "@/components/landing/values"

export function Values() {
    return (
        <section className="pt-10 tablet:pt-20 desktop:pt-30 pb-10 tablet:pb-30 desktop:pb-40">
            <motion.h2
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="header-4 text-center">
                Our values
            </motion.h2>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="flex flex-col desktop:flex-row mt-10 gap-4 mx-5">
                {values.map((value, index) => (
                    <Container gray={true} key={index} icon={value.icon} title={value.title} description={value.description} />
                ))}
            </motion.div>
        </section>
    )
}