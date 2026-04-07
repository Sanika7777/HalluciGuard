import Image from "next/image"
import footerImage from '@/public/footer.png'
import footerLogo from '@/public/footer-logo.svg'
import Link from "next/link"

const footerLinks = [
    {
        title: 'Product',
        href: '/',
    },
    {
        title: 'Journal',
        href: '/journal',
    },
    {
        title: 'About',
        href: '/about',
    },
    {
        title: 'Careers',
        href: '/careers',
    },
    {
        title: 'Get started',
        href: '/',
    },
]

export function Footer() {
    return (
        <footer className="p-5 bg-background-4 pt-10 tablet:pt-5">
            <div className="flex flex-col gap-10 tablet:gap-0 tablet:flex-row justify-between">
                <div className="flex flex-row gap-5 flex-wrap justify-center">
                    {footerLinks.map((link, index) => (
                        <Link key={index} href={link.href} className="paragraph-1-medium text-paragraph-3 hover:opacity-80">{link.title}</Link>
                    ))}
                </div>
                <p className="paragraph-2 text-paragraph-3 text-center">© 2026 • All rights reserved</p>
            </div>
            <Image src={footerImage} alt="Footer image" className="object-cover opacity-90 mix-blend-multiply w-full mt-5 h-30 tablet:h-70" />
            <Image src={footerLogo} alt="Logo" className="mt-5 w-full h-auto object-contain" />
        </footer>
    )
}