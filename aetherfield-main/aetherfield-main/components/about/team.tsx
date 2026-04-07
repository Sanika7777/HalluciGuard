'use client';
import { motion } from "motion/react";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const team = [
    {
        name: "Eunji Park",
        title: "Founder",
        email: "e.park@aetherfield.com"
    },
    {
        name: "Al Gorithm",
        title: "Senior Systems Architect",
        email: "a.gorithm@aetherfield.com"
    },
    {
        name: "Cassandra Query",
        title: "Head of Data Platforms",
        email: "c.query@aetherfield.com"
    },
    {
        name: "Sue Logic",
        title: "Principal Software Engineer",
        email: "s.logic@aetherfield.com"
    },
    {
        name: "Dash Bordman",
        title: "Product Manager",
        email: "d.bordman@aetherfield.com"
    },
    {
        name: "Greta Watt",
        title: "Director of Climate Strategy",
        email: "g.watt@aetherfield.com"
    },
    {
        name: "Gail Force",
        title: "Environment Risk Analyst",
        email: "g.force@aetherfield.com"
    },
    {
        name: "Polly Nation",
        title: "UX Designer",
        email: "p.nation@aetherfield.com"
    },
    {
        name: "Will O'Watt",
        title: "Clean Energy Solutions Manager",
        email: "w.owatt@aetherfield.com"
    },
    {
        name: "Lana Terra",
        title: "Earth Systems Research",
        email: "l.terra@aetherfield.com"
    },
    {
        name: "Ella Vation",
        title: "Earth Systems Researcher",
        email: "e.vation@aetherfield.com"
    },
    {
        name: "Phil Scope",
        title: "Lifecycle Assessment Specialist",
        email: "p.scope@aetherfield.com"
    }
]

export function Team() {
    return (
        <section className="py-10 tablet:py-20 desktop:py-30 px-5 flex flex-col gap-8 tablet:gap-16 bg-background-2">
            <motion.h2
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="header-3">Meet the team</motion.h2>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0, 0, 0, 1] }}
                viewport={{ once: true }}
                className="bg-background-2"
            >
                <Separator className="tablet:hidden" />
                <Table>
                    <TableHeader className="hidden tablet:table-header-group">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right">Contact</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            team.map((member, index) => (
                                <TableRow key={index}>
                                    <TableCell className="paragraph-1-medium text-xl leading-[100%]">{member.name}</TableCell>
                                    <TableCell>{member.title}</TableCell>
                                    <TableCell className="tablet:text-right"><a href={`mailto:${member.email}`} className="underline hover:opacity-65 transition-opacity ease-in-out">{member.email}</a></TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <Separator />
            </motion.div>
        </section>
    )
}