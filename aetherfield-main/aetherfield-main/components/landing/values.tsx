'use client';
import Image from "next/image";
import { motion } from 'motion/react';

export function Container({ icon, title, description, gray = false }: { icon: string, title: string, description: string, gray?: boolean }) {
    return (
        <div className={`p-10 flex flex-col gap-6 rounded-2xl ${gray ? 'bg-background-2' : 'bg-white'}`}>
            <Image src={icon} alt="Pie chart" height={42} width={42} />
            <div className="flex flex-col gap-2">
                <p className="paragraph-1-medium text-xl leading-[100%]">{title}</p>
                <p className="paragraph-2 text-xl leading-[100%]">{description}</p>
            </div>
        </div>
    )
}

export const values = [
    {
        icon: "/pie-chart.svg",
        title: "Clarity drives action",
        description: "We believe better decisions start with better data-measured, visible, and trusted.",
    },
    {
        icon: "/system.svg",
        title: "Sustainability is a systems problem",
        description: "We build tools that help teams connect the dots between operations, impact, and accountability.",
    },
    {
        icon: "/up.svg",
        title: "Progress over perfection",
        description: "We support real-world momentum-helping organizations move from ambition to measurable change.",
    },
]

export function Values() {
    return (
        <section className="bg-[url(/values-bg.jpg)] bg-cover desktop:py-30 tablet:py-20 py-10 px-5">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
            >
                <h2 className="header-1 text-center">Built for clarity</h2>
                <h2 className="header-2 text-center">Designed for action</h2>
            </motion.div>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="flex flex-col desktop:flex-row gap-4 mt-10">
                {values.map((value, index) => (
                    <Container key={index} icon={value.icon} title={value.title} description={value.description} />
                ))}
            </motion.div>
        </section>
    )
}