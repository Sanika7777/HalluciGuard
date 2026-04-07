'use client';
import { motion } from 'motion/react';
import Image from 'next/image';

export function Founder() {
    return (
        <section className="relative flex flex-col tablet:flex-row mx-5 gap-4 items-center pb-10 tablet:pb-20 desktop:pb-30">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="relative h-[378px] w-full tablet:h-[425px] tablet:min-w-93 desktop:h-175 desktop:min-w-153" >
                <Image src="/about/founder.png" fill alt="Founder" className=" object-cover object-top" />
            </motion.div>
            <motion.div
                initial={{ scale: 0.75, opacity: 0, y: 50, rotate: 60 }}
                whileInView={{ scale: 1, opacity: 1, y: 0, rotate: -7 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                drag
                dragConstraints={{
                    top: -50,
                    left: -50,
                    right: 50,
                    bottom: 50,
                }}
                className="cursor-pointer hidden tablet:block absolute top-0 left-0 desktop:-ml-12 desktop:-mt-[94px] -ml-[71px] -mt-[94px]"
            >
                <Image src="/sticker-1.svg" draggable={false} height={115} width={234} alt="Sticker" className="desktop:h-[147px] desktop:w-[298px]" />
            </motion.div>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="p-0 tablet:p-10 desktop:p-26.25">
                <span className="paragraph-2 text-paragraph-2">Founder's story</span>
                <h2 className="header-3">Eunji Park</h2>
                <p className="paragraph-2 mt-8 tablet:mt-14">
                    Eunji founded Aetherfield with one goal: to help companies take climate action without waiting for a perfect plan. With a background in environmental systems and software design, she’s spent the past decade building tools that turn impact goals into real-world outcomes. She still insists on biking to every investor meeting.
                </p>
            </motion.div>
        </section>
    )
}