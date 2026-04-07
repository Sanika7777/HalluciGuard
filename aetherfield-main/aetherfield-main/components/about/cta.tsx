'use client';
import { CallToAction } from "../cta";
import { useRouter } from "next/navigation";

export function CtaAbout() {
    const router = useRouter();
    return (
        <CallToAction
            buttonTitle="View Open Roles"
            heading="We're hiring! Want to join the team?"
            lightBg={false}
            onClick={() => router.push("/careers")}
        />
    )
}