import Image from "next/image"
import Link from "next/link";

interface JournalItemProps {
    cover: string;
    title: string;
    category: string;
    time: string;
    description: string;
}

export function JournalItem({ cover, title, category, time, description }: JournalItemProps) {
    return (
        <Link href="/article/how-to-build-a-climate-ready-data-stack" className="group">
            <figure className="relative h-[194px] tablet:h-[442px] desktop:h-89 w-full">
                <Image src={cover} alt="article cover" fill className="object-cover" />
            </figure>
            <div className="mt-5 flex flex-col gap-6">
                <div>
                    <h2 className="paragraph-1-medium group-hover:opacity-65 transition-opacity duration-300">{title}</h2>
                    <div className="flex mt-2 gap-2">
                        <span className="caption text-paragraph-2">{category}</span>
                        <span className="caption text-paragraph-2">&bull;</span>
                        <span className="caption text-paragraph-2">{time}</span>
                    </div>
                </div>
                <p className="paragraph-2 group-hover:opacity-65 transition-opacity duration-300">{description}</p>
            </div>
        </Link>
    )
}