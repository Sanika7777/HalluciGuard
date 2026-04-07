'use client';
import Image from "next/image"
import { Button } from "../ui/button"
import { motion } from 'motion/react';
import caseStudyImage from '@/public/case-study.png';
import { useRouter } from "next/navigation";

export function CaseStudy() {
    const router = useRouter();
    return (
        <section className="desktop:py-30 tablet:py-20 py-10 px-5 desktop:px-37.5">
            <motion.div
                initial={{ y: 150, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="p-5 flex flex-col tablet:flex-row gap-6 tablet:gap-10 rounded-2xl bg-background-2 items-center">
                <Image src={caseStudyImage} alt="People meeting and shaking hands" />
                <div>
                    <h3 className="paragraph-1-medium">Why Acme Inc chose Aetherfield</h3>
                    <p className="paragraph-2 mt-4">With fragmented data and growing reporting pressure, Acme turned to Aetherfield to streamline their ESG workflows. The result? Faster decisions, fewer spreadsheets, and 34% more coverage.</p>
                    <Button
                        variant="secondary"
                        className="mt-8 w-full tablet:w-auto"
                        onClick={() => router.push("/")}>Read case study</Button>
                </div>
            </motion.div>
        </section>
    )
}