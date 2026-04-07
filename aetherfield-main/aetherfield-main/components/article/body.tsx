'use client';
import { motion } from "motion/react";
import { Container, Paragraph } from "@/components/article";
import { Separator } from "@/components/ui/separator"

const data: { heading: string; content: string }[] = [
    {
        heading: "Why most data stacks fail at climate-readiness",
        content: "Traditional data stacks were built for business metrics—not climate metrics. They weren’t designed to handle the complexity of emissions data, the volatility of climate-related events, or the need for scenario modeling. As a result, most teams are stuck retrofitting existing systems or relying on brittle workarounds to generate insights. It’s time to rethink our infrastructure—starting with the foundation."
    },
    {
        heading: "The three pillars of a climate-ready data stack",
        content: "A climate-ready data stack needs three core capabilities: emissions tracking, supply chain visibility, and scenario modeling. Emissions tracking involves collecting and analyzing emissions data from various sources, including Scope 1, 2, and 3 emissions. Supply chain visibility requires mapping and monitoring emissions across the entire supply chain, from raw materials to end-of-life. Scenario modeling enables teams to run simulations and test different climate scenarios to understand potential impacts and identify mitigation strategies."
    },
    {
        heading: "Building your climate-ready data stack",
        content: "Building a climate-ready data stack involves several key steps. First, assess your current data infrastructure and identify gaps in your emissions tracking, supply chain visibility, and scenario modeling capabilities. Second, select the right tools and technologies to support your needs. Third, implement a data governance framework to ensure data quality and consistency. Finally, train your team on how to use the new system and interpret the insights it generates."
    },
    {
        heading: "The future of climate-ready data stacks",
        content: "The future of climate-ready data stacks will be characterized by greater automation, more sophisticated analytics, and deeper integration with other business systems. As climate change continues to impact businesses, the need for climate-ready data stacks will only grow. Companies that invest in building these capabilities now will be better positioned to adapt to future challenges and seize new opportunities."
    }
]

export function Body() {
    return (
        <>
            <motion.aside
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="px-5 tablet:px-20 desktop:px-25 pt-10 tablet:pt-20 flex flex-col desktop:flex-row gap-10 desktop:gap-35">
                <div className="flex flex-row desktop:flex-col gap-10 desktop:min-w-50">
                    <div className="w-1/2">
                        <span className="paragraph-2 text-paragraph-2">Published</span>
                        <p className="paragraph-1 text-paragraph-1 text-nowrap">March 3, 2026</p>
                    </div>
                    <div className="w-1/2">
                        <span className="paragraph-2 text-paragraph-2">Author</span>
                        <p className="paragraph-1 text-paragraph-1 text-nowrap">Lanna Terra</p>
                    </div>
                </div>
                <div className="flex flex-col gap-10 tablet:gap-12 justify-between">
                    <p className="article-paragraph">Climate action is only as strong as the data that informs it. But most data stacks weren’t designed with emissions, supply chains, or climate modeling in mind. Teams are often stuck retrofitting existing systems or relying on brittle workarounds to generate insights. It’s time to rethink our infrastructure—starting with the foundation.</p>
                    <Separator />
                </div>
            </motion.aside>
            <main className="pt-10 tablet:pt-12 pb-10 tablet:pb-20">
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                    viewport={{ once: true }}
                    className="desktop:ml-85 px-5 tablet:px-20 desktop:px-25">
                    <Container>
                        {
                            data.map((item, index) => (
                                <Paragraph key={index} heading={item.heading} text={item.content} />
                            ))
                        }
                    </Container>
                </motion.div>
            </main>
        </>
    )
}