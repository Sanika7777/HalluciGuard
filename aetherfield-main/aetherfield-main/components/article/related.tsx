'use client';
import { articles } from "@/components/landing/blog";
import { JournalItem } from "@/components/journalItem";
import Link from "next/link";

export function Related() {
    return (
        <div className="bg-background-2 py-10 tablet:py-20 desktop:py-30 px-5">
            <div className="flex flex-col tablet:flex-row gap-4 justify-between items-center tablet:items-baseline">
                <h2 className="header-3">Related articles</h2>
                <Link href='/journal' className="paragraph-2 underline hover:opacity-65 transition-opacity duration-300">View all articles</Link>
            </div>
            <div className="grid grid-cols-1 desktop:grid-cols-3 gap-x-5 gap-y-8 tablet:gap-y-10 mt-5">
                {articles.slice(0, 3).map((article, index) => (
                    <JournalItem key={index} cover={article.cover} title={article.title} category={article.category} time={article.time} description={article.description} />
                ))}
            </div>
        </div>
    )
}