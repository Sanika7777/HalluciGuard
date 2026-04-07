'use client';
import { motion } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Square } from 'lucide-react';
import { useRouter } from 'next/navigation';

const features = [
    {
        title: 'Track',
        description: 'Emissions, energy, and waste across your value chain'
    },
    {
        title: 'Model',
        description: 'Forecast performance and goal alignment'
    },
    {
        title: 'Report',
        description: 'Generate ESG disclosures, automate frameworks'
    },
    {
        title: 'Act',
        description: 'Surface insights and operational next steps'
    }
]


interface ListItemProps {
    title: string;
    number: number;
    description: string;
}

function ListItem({ title, number, description }: ListItemProps) {
    return (
        <div className='py-6 flex flex-col gap-4'>
            <div className='flex justify-between gap-4'>
                <p className='paragraph-1-medium'>{title}</p>
                <span className='caption text-paragraph-2'>00{number}</span>
            </div>
            <p className='paragraph-2'>{description}</p>
        </div>
    )
}

export function Features() {
    const router = useRouter();
    return (
        <section className="px-5 py-10 tablet:py-20 desktop:py-30" id="explore">
            <motion.h2
                className="header-4 text-center tablet:max-w-153 mx-auto"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
            >Everything you need to measure, model, and act on sustainability</motion.h2>
            <motion.div
                initial={{ y: 150, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className='flex desktop:flex-row flex-col gap-6 tablet:gap-10 mt-10'>
                <div className='relative  w-full h-[242px] tablet:h-120 desktop:h-auto desktop:max-w-[693px]'>
                    <Image src="/features-cover.png" fill alt="Features" className='object-cover' />
                </div>
                <div className='flex-1'>
                    <Separator />
                    {
                        features.map((feature, index) => (
                            <div key={index}>
                                <ListItem
                                    title={feature.title}
                                    number={index + 1}
                                    description={feature.description}
                                />
                                <Separator />
                            </div>
                        ))
                    }
                    <Separator />
                    <Button className='mt-6 w-full desktop:w-fit' onClick={() => router.push("/")}>
                        <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                        Explore Features
                    </Button>
                </div>
            </motion.div>
        </section>
    )
}