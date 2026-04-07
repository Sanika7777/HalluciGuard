'use client';
import { motion } from 'motion/react';
import { articles } from "@/components/landing/blog";
import { JournalItem } from "@/components/journalItem";

export function Articles() {
    return (
        <main className="px-5 pt-6 tablet:pt-10 desktop:pt-20 pb-4 tablet:pb-6 desktop:pb-10">
            <motion.h1
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="header-4 text-center">Latest articles</motion.h1>
            <div className="pb-10 tablet:pb-20 desktop:pb-30 grid grid-cols-1 desktop:grid-cols-2 gap-x-5 gap-y-20 w-full mt-10">
                {articles.map((article, index) => (
                    <JournalItem key={index} cover={article.cover} title={article.title} category={article.category} time={article.time} description={article.description} />
                ))}
            </div>
        </main>
    )
}