'use client';
import Image from "next/image"
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

function MetaData({ category, time }: { category: string; time: string }) {
    return (
        <div className="flex gap-2 mt-2">
            <span className="caption text-paragraph-2">{category}</span>
            <span className="caption text-paragraph-2">&bull;</span>
            <span className="caption text-paragraph-2">{time}</span>
        </div>
    )
}

interface ArticleProps {
    cover: string;
    title: string;
    category: string;
    time: string;
}

function Article({ cover, title, category, time }: ArticleProps) {
    return (
        <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col tablet:flex-row gap-4 py-6 group cursor-pointer"
        >
            <Image src={cover} alt="Article 1" height={100} width={165} className="w-full h-[203.03px] tablet:h-25 tablet:w-41.25 object-cover" />
            <div className="flex-1">
                <h3 className="paragraph-1-medium group-hover:opacity-65 transition-opacity duration-300">{title}</h3>
                <MetaData category={category} time={time} />
            </div>
        </motion.div>
    )
}

export const articles = [
    {
        cover: "/articles/article1.jpg",
        title: "How to Build a Climate-Ready Data Stack",
        category: "Insights",
        time: "4 min",
        description: "A practical guide for sustainability teams on integrating emissions, waste, and energy data into modern workflows."
    },
    {
        cover: "/articles/article2.jpg",
        title: "Sustainability Isn't a Side Project: Making Impact Operational",
        category: "Strategy",
        time: "7 min",
        description: "Why climate goals belong in your roadmap—not just in the annual ESG report."
    },
    {
        cover: "/articles/article3.jpg",
        title: "Inside the Aetherfield Model: How We Turn Data Into Action",
        category: "Insights",
        time: "5 min",
        description: "A behind-the-scenes look at our platform logic, system architecture, and sustainability reasoning."
    },
    {
        cover: '/articles/article4.jpg',
        title: "From Spreadsheets to Systems: The Evolution of Climate Reporting",
        category: "Tooling",
        time: "6 min",
        description: "Why legacy tools aren’t enough—and what the next generation of reporting looks like."
    },
    {
        cover: '/articles/article5.jpg',
        title: "Carbon Accounting:Myths, Models, and Must-Haves",
        category: "Tooling",
        time: "6 min",
        description: "Debunking common assumptions and offering a framework for getting it right."
    },
    {
        cover: "/articles/article6.jpg",
        title: "Seeing Clearly:Designing Feedback Loops for Sustainable Growth",
        category: "Strategy",
        time: "4 min",
        description: "Buildling responsive systems that keep sustainability strategy adaptive and actionable."
    }
]

export function BlogSection() {
    const router = useRouter();
    return (
        <motion.section
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
            viewport={{ once: true }}
        >
            <h2 className="header-4 text-center">From the journal</h2>
            <div className="mx-5 tablet:mx-auto tablet:max-w-155 mt-6 tablet:mt-10 relative">
                <Separator />
                {articles.slice(0, 3).map((article, index) => (
                    <div key={index}>
                        <Article {...article} />
                        <Separator />
                    </div>
                ))}
                <div className="w-full flex justify-center">
                    <Button
                        onClick={() => router.push("/journal")}
                        variant='secondary'
                        className="mt-6 w-full tablet:w-auto"
                    >View all articles</Button>
                </div>
                <motion.div
                    initial={{ rotate: 60, scale: 0.75, opacity: 0 }}
                    whileInView={{ rotate: -10, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0, 0, 0, 1] }}
                    viewport={{ once: true }}
                    drag
                    className="cursor-pointer absolute top-0 left-0 tablet:-mt-[142.95px] tablet:-ml-[182.41px] desktop:-mt-[109px] desktop:-ml-[287px]"
                >
                    <Image src={"/sticker-2.png"} draggable={false} alt="Aetherfield Journal" height={154} width={400} className="hidden tablet:block tablet:w-[333px] tablet:h-[190px] desktop:h-[225px] desktop:w-[400px]" />
                </motion.div>
            </div>
        </motion.section>
    )
}