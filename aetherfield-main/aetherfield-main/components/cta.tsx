'use client';
import { Button } from "./ui/button";
import { Square } from "lucide-react";
import { useRouter } from "next/navigation";

interface CtaProps {
    buttonTitle: string;
    heading: string;
    lightBg?: boolean;
    onClick?: () => void;
}

export function CallToAction({ buttonTitle, heading, lightBg = true, onClick }: CtaProps) {
    const router = useRouter();
    return (
        <section className={`py-10 tablet:py-20 desktop:py-30 px-5 ${lightBg ? 'bg-background-2' : 'bg-white'}`}>
            <h3 className="header-4 text-center">{heading}</h3>
            <div className="flex justify-center mt-8">
                <Button onClick={onClick ? onClick : () => router.push("/")}>
                    <Square strokeWidth={20} style={{ height: 4, width: 4 }} />
                    {buttonTitle}
                </Button>
            </div>
        </section>
    )
}