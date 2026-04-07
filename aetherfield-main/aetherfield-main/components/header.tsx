'use client'
import Image from "next/image"
import { Button } from "./ui/button";
import * as React from 'react';
import { Separator } from "@/components/ui/separator";
import { motion } from 'motion/react';
import Link from "next/link";

interface NavLinkProps {
    title: string;
    href: string;
}

export function NavLink({ title, href }: NavLinkProps) {
    return (
        <div className="py-6 tablet:py-0">
            <Link href={href} className="header-4 tablet:nav-link hover:opacity-65 ease-in-out duration-300">{title}</Link>
        </div>
    )
}

const links = [
    {
        title: 'Product',
        href: '/'
    },
    {
        title: 'Journal',
        href: '/journal'
    },
    {
        title: 'About',
        href: '/about'
    },
    {
        title: 'Careers',
        href: '/careers'
    }
]


export function Header() {
    const [menuOpen, setMenuOpen] = React.useState(false)
    return (
        <>
            <motion.header
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0, 0, 0, 1] }}
                className={`sticky top-0 left-0 h-auto z-60 backdrop-blur-3xl ${menuOpen ? 'bg-white' : 'bg-white/10'} transition-opacity ease-in-out duration-300`}>
                <div className="w-full p-5 flex items-center  justify-between z-50">
                    <a href="/">
                        <Image src="/logo.svg" alt='Aetherfield logo' height={20} width={122} />
                    </a>
                    <div className="block tablet:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                        <Image src='/plus.svg' height={14} width={14} alt="Plus icon" className={`${menuOpen ? 'rotate-45' : 'rotate-0'} transition-transform cursor-pointer`} />
                    </div>
                    <div className="gap-5 hidden tablet:flex">
                        {
                            links.map((link, index) => (
                                <NavLink
                                    title={link.title}
                                    href={link.href}
                                    key={index}
                                />
                            ))
                        }
                        <Button variant={'link'}>
                            <div className="group flex gap-1">
                                Get Started
                                <div className="flex justify-start items-center group-hover:translate-x-[3px] transition-transform">
                                    <Image src="/arrow.svg" alt="right arrow" height={9} width={11.23} />
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            </motion.header>
            <section className={`${menuOpen ? 'h-auto translate-y-0 opacity-100 w-full' : 'h-0 -translate-y-6 opacity-0 -z-10'} fixed backdrop-blur-3xl z-10 bg-white transition-all tablet:hidden shadow-xl`}>
                <nav className="px-5 ">
                    {
                        links.map((link, index) => (
                            <div key={index}>
                                <NavLink
                                    title={link.title}
                                    href={link.href}
                                />
                                <Separator />
                            </div>
                        ))
                    }
                </nav>
                <div className={`${menuOpen ? 'h-24' : 'h-0'} transition-all ease-in-out duration-300`}>
                </div>
            </section>
        </>
    )
}