'use client';

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Image from "next/image";
import { Container, Paragraph, BulletList } from "../article";
import { Separator } from "../ui/separator";
import { Square } from "lucide-react";
import { useRouter } from "next/navigation";

const jobData = {
    companyDescription: {
        heading: "Company Description",
        content:
            "At Aetherfield, we build software that empowers companies to lead with climate accountability. Our platform helps sustainability and operations teams make sense of complex environmental data—transforming emissions, waste, and energy metrics into measurable, meaningful action. We’re a mission-driven team of technologists, designers, and scientists working to accelerate the shift toward a low-carbon future."
    },

    aboutRole: {
        heading: "About the Role",
        content:
            "As a Data Scientist at Aetherfield, you’ll help shape the analytical engine behind our platform. You’ll collaborate with product and engineering teams to design models that interpret environmental impact, forecast future trends, and uncover actionable insights for our customers. Your work will directly influence how companies plan, report, and act on their sustainability strategies."
    },

    requirements: {
        heading: "Requirements",
        items: [
            "3+ years of experience in data science or applied analytics (Python, SQL, etc.)",
            "Experience working with climate, sustainability, or supply chain datasets is a plus",
            "Strong foundation in statistics and data modeling",
            "Ability to communicate complex insights clearly to both technical and non-technical teams",
            "Curiosity, clarity, and care in how you approach messy data",
            "Passion for solving real-world problems with purpose and precision"
        ]
    },

    benefits: {
        heading: "Company Benefits",
        items: [
            "Competitive salary and equity options",
            "Flexible, hybrid work environment",
            "Generous PTO and paid volunteer days",
            "Annual sustainability stipend",
            "Team offsites and climate-focused retreats",
            "A mission-first culture that values clarity, impact, and integrity"
        ]
    }
};

export function Content() {
    const router = useRouter();
    return (
        <main className="bg-linear-(--background-3) w-full pt-31 tablet:pt-36 -mt-16 pb-30 flex flex-col items-center justify-center gap-6 tablet:gap-10">
            <motion.button
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                onClick={() => router.push("/careers")} className="paragraph-2 hover:opacity-65 transition-opacity duration-300">← Back to Careers</motion.button>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="relative bg-white mx-5 rounded-2xl tablet:mx-10 max-w-205 w-fit p-6 pb-8 tablet:p-10 tablet:pb-10">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="header-4">Senior Data Engineer</h1>
                            <p className="paragraph-2 text-paragraph-2">Full Time &bull; Denver, CO</p>
                        </div>
                        <p className="paragraph-2">Help build the intelligence layer for climate action. You'll turn complex sustainability data into clear, actionable insights for enterprise teams.</p>
                    </div>
                    <div>
                        <Button onClick={() => router.push("/")} variant={'secondary'}>Apply now</Button>
                    </div>
                </div>
                <Separator className="my-8 tablet:my-12" />
                <Container>
                    <Paragraph heading={jobData.companyDescription.heading} text={jobData.companyDescription.content} />
                    <Paragraph heading={jobData.aboutRole.heading} text={jobData.aboutRole.content} />
                    <BulletList heading={jobData.requirements.heading} listItems={jobData.requirements.items} />
                    <BulletList heading={jobData.benefits.heading} listItems={jobData.benefits.items} />
                </Container>
                <Separator className="my-12" />
                <div className="flex flex-col items-center gap-6">
                    <h3 className="header-4 text-center">Ready to help build the <br />future of climate intelligence?</h3>
                    <Button onClick={() => router.push("/")}>
                        <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                        Apply now
                    </Button>
                </div>
                <motion.div
                    initial={{ scale: 0.75, opacity: 0, y: 50, rotate: 60 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0, rotate: 7 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0, 0, 0, 1] }}
                    viewport={{ once: true }}
                    drag
                    dragConstraints={{
                        top: -50,
                        left: -50,
                        right: 50,
                        bottom: 50,
                    }}
                    className="cursor-pointer hidden tablet:block absolute bottom-0 right-0 desktop:-mr-30 desktop:mb-80 mb-70 -mr-20"
                >
                    <Image src="/sticker-1.svg" draggable={false} height={115} width={234} alt="Sticker" className="desktop:h-[147px] desktop:w-[298px]" />
                </motion.div>
            </motion.div>
        </main>
    )
} 