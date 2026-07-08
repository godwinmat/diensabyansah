import { TestimonialsSubmissionForm } from "@/components/testimonials-submission-form";
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
import { getAuthCookieName, verifySessionToken } from "@/lib/auth";
import { getPublicTestimonials } from "@/lib/testimonials";
import { cookies } from "next/headers";
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

function formatQuote(value: string) {
    const trimmed = value.trim();

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed;
    }

    return `"${trimmed}"`;
}

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAuthCookieName())?.value ?? "";
    const session = verifySessionToken(token);
    const { textTestimonials, videoTestimonials } =
        await getPublicTestimonials();

    return (
        <div className="bg-[#f4f4f3]">
            <section className="mx-auto grid w-full max-w-7xl gap-6 px-3 py-5 sm:px-5 sm:gap-8 sm:py-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-10 lg:py-8 reveal-up">
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

                <div className="image-zoom overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <Image
                        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1100&q=80"
                        alt="Model portrait"
                        width={920}
                        height={1120}
                        className="h-auto w-full object-cover"
                    />
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 lg:px-10 lg:py-8 reveal-up">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                        className="h-auto justify-start p-0 text-xs font-semibold uppercase tracking-[0.18em] text-primary no-underline hover:no-underline"
                    >
                        <Link href="#">View all stories →</Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {(videoTestimonials.length > 0
                        ? videoTestimonials
                        : videos
                    ).map((video) => (
                        <article
                            key={"videoUrl" in video ? video.id : video.title}
                            className="image-zoom relative overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]"
                        >
                            {"videoUrl" in video ? (
                                <>
                                    <video
                                        src={video.videoUrl}
                                        controls
                                        controlsList="nodownload"
                                        muted={false}
                                        disablePictureInPicture
                                        preload="metadata"
                                        className="h-52 w-full object-cover sm:h-64"
                                    />
                                    <div className="border-t border-[#e5e7eb] bg-white px-4 py-4">
                                        <p className="text-sm font-semibold text-[#1f2937]">
                                            {video.name}
                                        </p>
                                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#94a3b8]">
                                            Client Video Testimony
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Image
                                        src={video.image}
                                        alt={video.title}
                                        width={920}
                                        height={520}
                                        className="h-52 w-full object-cover sm:h-64"
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
                                </>
                            )}
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 lg:px-10 lg:py-8 reveal-up">
                <Card className="gap-0 rounded-2xl border border-[#dfe4e9] bg-[#f8f8f7]/86 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)]">
                    <CardContent className="px-3 sm:px-5 py-8 lg:px-8 lg:py-10">
                        <h2 className="text-3xl font-light text-[#6b7280] md:text-5xl">
                            Institutional Partners
                        </h2>

                        <div className="mt-6 grid gap-4 md:hidden">
                            {partnerRows.map((row) => (
                                <article
                                    key={row.partner}
                                    className="rounded-xl border border-[#e2e7ed] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
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

                        <div className="mt-8 hidden overflow-hidden rounded-xl border border-[#e2e7ed] bg-white md:block">
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

            <section className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-8 lg:px-10 lg:py-10 reveal-up">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <div>
                        <h2 className="text-3xl font-semibold leading-none text-[#1e293b] sm:text-4xl lg:text-5xl">
                            Private Clientele
                        </h2>
                        <p className="mt-2 text-base text-[#7c8da0] sm:text-lg">
                            Personal stories of fit, fabric, and finesse.
                        </p>
                    </div>
                    <p className="text-3xl font-semibold text-primary sm:text-right">
                        ”
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {(textTestimonials.length > 0
                        ? textTestimonials
                        : clients
                    ).map((client) => (
                        <Card
                            key={
                                "quote" in client && "location" in client
                                    ? client.name
                                    : client.id
                            }
                            className="gap-0 rounded-2xl border border-[#e3e8ed] bg-white py-0 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
                        >
                            <CardContent className="p-5">
                                <p className="text-primary">★★★★★</p>
                                <p className="mt-4 text-lg leading-8 text-[#6b7280]">
                                    {formatQuote(client.quote)}
                                </p>
                                <Separator className="mt-6 bg-[#e5e9ee]" />
                                <div className="pt-4">
                                    <div className="flex items-center gap-3">
                                        {"avatar" in client ? (
                                            <Image
                                                src={client.avatar}
                                                alt={client.name}
                                                width={44}
                                                height={44}
                                                className="h-11 w-11 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5edd0] text-sm font-semibold text-primary">
                                                {client.name
                                                    .slice(0, 1)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xl font-semibold text-[#1f2937]">
                                                {client.name}
                                            </p>
                                            <p className="text-xs uppercase tracking-widest text-[#94a3b8]">
                                                {"location" in client
                                                    ? client.location
                                                    : "Private Client"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 pb-12 pt-6 sm:px-5 lg:px-10 lg:pb-14 reveal-up">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[#201b10] text-white shadow-[0_26px_80px_-34px_rgba(32,27,16,0.72)] sm:rounded-[2rem]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
                    <div className="absolute -left-14 top-8 h-28 w-28 rounded-full border border-white/10 sm:-left-12 sm:top-10 sm:h-36 sm:w-36" />
                    <div className="absolute -right-14 bottom-4 h-32 w-32 rounded-full border border-primary/20 sm:-right-10 sm:bottom-6 sm:h-44 sm:w-44" />

                    <div className="relative grid gap-8 px-4 py-8 text-left sm:px-6 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:px-10 lg:py-12">
                        <div className="flex flex-col justify-between text-left">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/90">
                                    Share Your Experience
                                </p>
                                <h2 className="mt-4 text-[2.2rem] font-semibold leading-[0.96] sm:text-5xl lg:text-6xl">
                                    Add Your Voice
                                    <br />
                                    to the Archive
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
                                    Submit a written reflection or a short video
                                    testimony and become part of the evolving
                                    Diensa narrative. Text stories appear under
                                    Private Clientele, while videos are featured
                                    in In Motion.
                                </p>
                            </div>

                            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:mt-10">
                                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90">
                                        Written Stories
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/80">
                                        Share detail on fit, service, fabric,
                                        and how the piece lives with you.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90">
                                        Video Moments
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/80">
                                        Upload a short clip up to 10MB for the
                                        motion gallery experience.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4 text-left shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)] backdrop-blur-md sm:rounded-[1.5rem] sm:p-6">
                            <div className="mb-4 flex flex-col items-start gap-3 border-b border-white/10 pb-4 text-left sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                                        Submission Studio
                                    </p>
                                    <p className="mt-1 text-sm text-white/65">
                                        {session
                                            ? "Choose your format and submit directly from your account."
                                            : "Sign in to submit a testimony and manage your account history."}
                                    </p>
                                </div>
                                <Badge className="h-auto self-start rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-primary sm:self-auto">
                                    Authenticated Access
                                </Badge>
                            </div>

                            <TestimonialsSubmissionForm
                                authenticated={Boolean(session)}
                            />

                            <div className="mt-6 flex flex-col items-stretch gap-3 border-t border-white/10 pt-5 text-left sm:flex-row sm:items-center">
                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="h-12 w-full rounded-none border-white/25 bg-transparent px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/10 sm:flex-1"
                                >
                                    <Link
                                        href={
                                            session
                                                ? "/account/profile"
                                                : "/account"
                                        }
                                    >
                                        {session
                                            ? "View Your Profile"
                                            : "Sign In to Submit"}
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    type="button"
                                    className="h-12 w-full rounded-none bg-primary px-6 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-primary/90 sm:flex-1"
                                >
                                    <Link href="/contact">
                                        Contact Concierge
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
