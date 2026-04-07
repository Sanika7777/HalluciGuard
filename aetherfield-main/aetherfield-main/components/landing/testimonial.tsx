'use client';
import Image from "next/image";
import { motion } from 'motion/react';
import testimonialImage from '@/public/testimonial.png';

export function Testimonial() {
    return (
        <section
            className="py-10 tablet:py-20 desktop:py-30 px-5 flex flex-col tablet:flex-row gap-8 tablet:gap-4 items-center"
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="h-[383px] tablet:h-175 w-full tablet:w-1/2 relative"
            >
                <Image src={testimonialImage} fill alt='Gentleman with crossed hands sitting' className="object-cover" />
            </motion.div>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="tablet:px-10 desktop:px-26.25 w-full tablet:w-1/2">
                <Image src="/quotation.svg" height={20} width={24} alt="Quotation" />
                <p className="header-4 mt-6 tablet:mt-10 desktop:mt-14">
                    We finally moved past spreadsheets and guesswork. Now we have real data to guide real decisions.
                </p>
                <div className="mt-6 tablet:mt-10 desktop:mt-14">
                    <p className="paragraph-1-medium text-xl leading-[100%]">Elliot Williams</p>
                    <p className="paragraph-2 mt-2 text-paragraph-2">Head of Sustainability, Flux Materials</p>
                </div>
            </motion.div>
        </section>
    )
}