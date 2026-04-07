'use client';
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface JobListingProps {
    title: string;
    type: string;
    location: string;
    description: string;
    buttonText?: string;
    transparent?: boolean;
}

function JobListing({ title, type, location, description, buttonText = "View role", transparent = false }: JobListingProps) {
    const router = useRouter();
    return (
        <div
            className={`flex flex-col tablet:flex-row gap-6 p-6 tablet:p-10 w-full max-w-205 justify-between rounded-2xl ${transparent ? 'bg-transparent border border-dashed border-paragraph-1' : 'bg-white'}`}
        >
            <div className="flex flex-col gap-4 tablet:gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="paragraph-1-medium">{title}</h2>
                    <p className="caption text-paragraph-2">{type} · {location}</p>
                </div>
                <p className="paragraph-2">
                    {description}
                </p>
            </div>
            <div>
                <Button variant={'secondary'} onClick={() => router.push("/job-listing")}>{buttonText}</Button>
            </div>
        </div>
    )
}

const jobs = [
    {
        title: "Senior Systems Architect",
        type: "Contract",
        location: "San Francisco, CA",
        description: "Shape the tools that drive climate intelligence. You’ll lead cross-functional teams to build thoughtful, scalable solutions for sustainability-forward organizations.",
    },
    {
        title: "Data Scientist",
        type: "Full-time",
        location: "Denver, CO",
        description: "Help build the intelligence layer for climate action. You'll turn complex sustainability data into clear, actionable insights for enterprise teams."
    },
    {
        title: "Product Manager",
        type: "Part-time",
        location: "Seattle, WA",
        description: "Shape the tools that drive climate intelligence. You'll lead cross-functional teams to build thoughtful, scalable solutions for sustainability-forward organizations."
    }
]


export function Listings() {
    return (
        <main className="bg-linear-(--background-3) w-full pt-15 tablet:pt-36 -mt-16 pb-30">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
            >
                <h1 className="header-1 text-center">Careers at</h1>
                <h1 className="header-2 text-center">Aetherfiled</h1>
            </motion.div>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="flex mx-5 flex-col gap-4 mt-8 tablet:mt-10 justify-between items-center">
                {
                    jobs.map((job, index) => (
                        <JobListing key={index} title={job.title} type={job.type} location={job.location} description={job.description} />
                    ))
                }
                <JobListing
                    title="Open application"
                    type="Full-time"
                    location="Denver, CO"
                    description="Don't see your role available? Apply for an open application!"
                    buttonText="Apply Now"
                    transparent={true}
                />
            </motion.div>
        </main>
    )
}