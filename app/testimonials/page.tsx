import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";

const videos = [
    {
        title: "Global Textiles Group",
        subtitle: "Manufacturing Excellence",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
    },
    {
        title: "Elena S.",
        subtitle: "Private Client, Milan",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    },
    {
        title: "Marcus T.",
        subtitle: "Private Client, London",
        image: "https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=1200&q=80",
    },
];

const partnerRows = [
    {
        partner: "Global Textiles Group",
        focus: "Manufacturing Scale",
        testimonial:
            '"The production capacity of Diensa by Ansah remains unmatched in the luxury sector, maintaining artisanal quality at scale. Their precision in large-scale garment construction is transformative."',
    },
    {
        partner: "Ethical Weavers Co.",
        focus: "Ethical Production",
        testimonial:
            '"Their commitment to ethical sourcing and sustainable heritage techniques sets a new standard for modern luxury manufacturing. They don\'t just build clothes; they build legacies."',
    },
];

const clients = [
    {
        quote: '"The way the silk moves is hypnotic. I\'ve never found a brand that balances traditional fabric weight with such a contemporary silhouette. The fit was impeccable from the first wear."',
        name: "Elena S.",
        location: "Milan, Italy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=280&q=80",
    },
    {
        quote: '"As someone who appreciates tailored heritage, Ansah\'s work is a revelation. The linen blend is breathable yet structured—perfect for high-end events in warmer climates."',
        name: "Marcus T.",
        location: "London, UK",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=280&q=80",
    },
    {
        quote: '"An exceptional experience from consultation to delivery. The attention to detail in the embroidery is unlike anything else in my wardrobe. A true modern heirloom."',
        name: "Sophie L.",
        location: "Paris, France",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=280&q=80",
    },
];

export default function TestimonialsPage() {
    return (
        <div className="bg-[#f4f4f3]">
            <section className="mx-auto grid w-full max-w-screen gap-6 px-3 sm:px-5 py-5 sm:gap-8 sm:py-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-10 lg:py-8 reveal-up">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                        Testimonials
                    </p>
                    <h1 className="mt-3 text-4xl font-light leading-[0.94] tracking-tight text-[#374151] sm:text-6xl md:text-8xl">
                        Voices of
                        <br />
                        Excellence
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#64748b] sm:mt-5 sm:text-xl sm:leading-9">
                        A legacy of refined craftsmanship and modern heritage,
                        told through the experiences of our global partners and
                        private clientele. Discover the standard of Diensa.
                    </p>
                    <Button
                        asChild
                        className="mt-7 inline-flex h-12 w-full items-center rounded-none bg-primary px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm sm:mt-8 sm:w-auto sm:text-sm"
                    >
                        <Link href="/products">Explore the Collection →</Link>
                    </Button>
                </div>

                <div className="image-zoom hover-lift overflow-hidden rounded-lg shadow-md">
                    <Image
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=80"
                        alt="Model portrait"
                        width={920}
                        height={1120}
                        className="h-auto w-full object-cover"
                    />
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 py-5 sm:py-6 lg:px-10 lg:py-8 reveal-up">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                            Video Stories
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold leading-none text-[#1e293b] sm:text-5xl lg:text-6xl">
                            In Motion
                        </h2>
                        <p className="mt-2 text-base text-[#7c8da0] sm:text-lg">
                            Authentic voices from our global network, sharing
                            their Diensa experience in their own words.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-xs font-semibold uppercase tracking-[0.18em] text-primary no-underline hover:no-underline"
                    >
                        <Link href="#">View all stories →</Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {videos.map((video) => (
                        <article
                            key={video.title}
                            className="image-zoom hover-lift relative overflow-hidden rounded-lg"
                        >
                            <Image
                                src={video.image}
                                alt={video.title}
                                width={920}
                                height={520}
                                className="h-56 w-full object-cover sm:h-64"
                            />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/50 text-white">
                                    ▶
                                </div>
                            </div>
                            <div className="absolute inset-x-4 bottom-4 text-white">
                                <p className="text-sm font-semibold">
                                    {video.title}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.12em] text-white/85">
                                    {video.subtitle}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 py-6 lg:px-10 lg:py-8 reveal-up">
                <Card className="glass-panel hover-lift gap-0 rounded-lg border-[#dfe4e9] bg-[#f8f8f7]/86 py-0 shadow-none">
                    <CardContent className="px-3 sm:px-5 py-8 lg:px-8 lg:py-10">
                        <h2 className="text-3xl font-light text-[#6b7280] md:text-5xl">
                            Institutional Partners
                        </h2>

                        <div className="mt-6 grid gap-4 md:hidden">
                            {partnerRows.map((row) => (
                                <article
                                    key={row.partner}
                                    className="hover-lift rounded-sm border border-[#e2e7ed] bg-white p-4"
                                >
                                    <p className="text-2xl font-semibold leading-tight text-[#1f2937]">
                                        {row.partner}
                                    </p>
                                    <Badge className="mt-3 rounded-none bg-[#f5edd0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary hover:bg-[#f5edd0]">
                                        {row.focus}
                                    </Badge>
                                    <p className="mt-4 text-sm leading-6 text-[#64748b]">
                                        {row.testimonial}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-8 hidden rounded-sm border border-[#e2e7ed] bg-white md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] lg:px-6">
                                            Partner
                                        </TableHead>
                                        <TableHead className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] lg:px-6">
                                            Focus
                                        </TableHead>
                                        <TableHead className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] lg:px-6">
                                            Testimonial
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partnerRows.map((row) => (
                                        <TableRow
                                            key={row.partner}
                                            className="hover:bg-transparent"
                                        >
                                            <TableCell className="px-4 py-5 text-3xl font-semibold leading-tight whitespace-normal text-[#1f2937] lg:px-6">
                                                {row.partner}
                                            </TableCell>
                                            <TableCell className="px-4 py-5 whitespace-normal lg:px-6">
                                                <Badge className="rounded-none bg-[#f5edd0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary hover:bg-[#f5edd0]">
                                                    {row.focus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-5 text-base leading-7 whitespace-normal text-[#64748b] lg:px-6">
                                                {row.testimonial}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 py-6 sm:py-8 lg:px-10 lg:py-10 reveal-up">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-semibold leading-none text-[#1e293b] sm:text-4xl lg:text-5xl">
                            Private Clientele
                        </h2>
                        <p className="mt-2 text-base text-[#7c8da0] sm:text-lg">
                            Personal stories of fit, fabric, and finesse.
                        </p>
                    </div>
                    <p className="text-3xl font-semibold text-primary">”</p>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Card
                            key={client.name}
                            className="gap-0 rounded-none border-[#e3e8ed] bg-white py-0 shadow-none"
                        >
                            <CardContent className="p-5">
                                <p className="text-primary">★★★★★</p>
                                <p className="mt-4 text-lg leading-8 text-[#6b7280]">
                                    {client.quote}
                                </p>
                                <Separator className="mt-6 bg-[#e5e9ee]" />
                                <div className="pt-4">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={client.avatar}
                                            alt={client.name}
                                            width={44}
                                            height={44}
                                            className="h-11 w-11 rounded-md object-cover"
                                        />
                                        <div>
                                            <p className="text-xl font-semibold text-[#1f2937]">
                                                {client.name}
                                            </p>
                                            <p className="text-xs uppercase tracking-widest text-[#94a3b8]">
                                                {client.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 pb-12 pt-6 lg:px-10 lg:pb-14 reveal-up">
                <div className="glass-panel hover-lift rounded-lg bg-linear-to-r from-[#3a3521] via-[#5b4d23] to-[#6f6325] px-6 py-16 text-center text-white lg:px-10">
                    <p className="text-3xl text-primary">✎</p>
                    <h2 className="mt-3 text-3xl font-semibold sm:text-5xl lg:text-6xl">
                        Share Your Experience
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-xl sm:leading-8">
                        Your voice contributes to our heritage. We invite our
                        private clientele to share their journey with our latest
                        collections.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            type="button"
                            className="h-12 rounded-none bg-primary px-8 text-sm font-semibold uppercase tracking-[0.16em] text-white"
                        >
                            Write a Review
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-none border-white/45 bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/10"
                        >
                            Contact Concierge
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
