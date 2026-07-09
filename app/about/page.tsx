import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

const pillars = [
    {
        title: "Industrial Precision",
        description:
            "Our Douala facility blends rigorous process controls with hand-finished excellence.",
        cta: "See Our Standards",
        image: "/diensa-images/958A1913.jpeg",
    },
    {
        title: "Ethical Ecosystem",
        description:
            "We source through trusted regional partners and invest directly in artisan communities.",
        cta: "Meet Our Network",
        image: "/diensa-images/958A2416.jpeg",
    },
    {
        title: "Craft Leadership",
        description:
            "Female-led teams elevate traditional techniques into globally competitive products.",
        cta: "Meet The Team",
        image: "/diensa-images/IMG_7618.jpeg",
    },
];

const gallery = [
    "/diensa-images/958A1769.jpeg",
    "/diensa-images/958A2292.jpeg",
    "/diensa-images/958A2307.jpeg",
    "/diensa-images/IMG_3560.jpeg",
    "/diensa-images/IMG_6827.jpeg",
    "/diensa-images/IMG_6642.jpeg",
    "/diensa-images/IMG_6429.jpeg",
    "/diensa-images/IMG_7616.jpeg",
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            <section className="mx-auto w-full max-w-7xl px-3 pt-6 sm:px-5 lg:px-10 lg:pt-8 reveal-up">
                <div className="relative overflow-hidden rounded-2xl image-zoom shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <div className="relative h-[44svh] min-h-80 sm:h-[56svh]">
                        <Image
                            src="/diensa-images/958A1729.jpeg"
                            alt="Diensa production floor"
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover object-[50%_15%]"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#0f2f44]/55" />
                    <div className="absolute inset-x-4 bottom-6 text-white sm:inset-x-6 lg:inset-x-10 lg:bottom-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                            Industrial Luxury
                        </p>
                        <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                            Building Africa&apos;s Next Fashion Manufacturing
                            Standard
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
                            We pair heritage craft with scalable systems to
                            deliver premium products from Cameroon to the world.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-3 py-12 sm:px-5 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-16 reveal-up">
                <div>
                    <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#0f172a] lg:text-6xl">
                        Made in Africa:
                        <br />
                        <span className="text-primary">
                            Scaled with Purpose.
                        </span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-xl leading-9 text-[#64748b]">
                        Diensa by Ansah is a female-led manufacturing company
                        transforming African fashion into a globally trusted
                        supply and design force.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button
                            asChild
                            className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2937]"
                        >
                            <Link href="/contact">Book A Factory Visit</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 rounded-sm border-[#d6dce5] px-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#0f172a]"
                        >
                            <Link href="/gallery">View Full Gallery</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="image-zoom relative h-72 overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]">
                        <Image
                            src="/diensa-images/958A2307.jpeg"
                            alt="Factory operations"
                            fill
                            sizes="(min-width: 1024px) 24vw, 100vw"
                            className="object-cover object-[50%_38%]"
                        />
                    </div>
                    <div className="image-zoom relative h-72 overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]">
                        <Image
                            src="/diensa-images/IMG_0616.jpeg"
                            alt="Design and production"
                            fill
                            sizes="(min-width: 1024px) 24vw, 100vw"
                            className="object-cover object-top"
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-10 lg:px-10 lg:py-12 reveal-up">
                <h3 className="pb-4 text-3xl font-semibold text-[#0f172a]">
                    Core Pillars
                </h3>
                <Separator className="bg-[#e2e8f0]" />

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {pillars.map((pillar) => (
                        <Card
                            key={pillar.title}
                            className="group gap-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]"
                        >
                            <div className="image-zoom relative h-80 overflow-hidden rounded-t-2xl bg-[#f8fafc]">
                                <Image
                                    src={pillar.image}
                                    alt={pillar.title}
                                    fill
                                    sizes="(min-width: 768px) 31vw, 100vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                            </div>
                            <h4 className="px-4 pt-1 text-3xl font-semibold text-[#0f172a]">
                                {pillar.title}
                            </h4>
                            <p className="p-4  text-lg leading-8 text-[#94a3b8]">
                                {pillar.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-5 lg:px-10 lg:py-12 reveal-up">
                <div className="glass-panel relative overflow-hidden rounded-2xl border border-[#ece6d8] bg-[#f7f5ee]/88 px-3 py-10 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)] sm:px-8 lg:px-14 lg:py-14">
                    <div className="absolute -right-6 -top-14 text-[16rem] font-black leading-none text-[#ece9dd]">
                        DA
                    </div>
                    <Badge className="relative h-auto bg-transparent px-0 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Legacy
                    </Badge>
                    <h3 className="relative mt-2 text-5xl font-semibold tracking-tight text-[#0f172a] lg:text-6xl">
                        The Diensa Story
                    </h3>
                    <p className="relative mt-6 max-w-4xl text-xl leading-9 text-[#64748b]">
                        Founded on the belief that luxury should be synonymous
                        with impact, Diensa by Ansah emerged as a pioneer in
                        African industrialization. Today we operate one of the
                        continent&apos;s leading fashion manufacturing hubs,
                        where industrial efficiency never sacrifices the human
                        touch.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-5 lg:px-10 lg:py-12 reveal-up">
                <div className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-8 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.32)] sm:px-8 lg:px-10">
                    <Badge className="h-auto bg-transparent px-0 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Founder Bio
                    </Badge>
                    <h3 className="mt-2 text-4xl font-semibold tracking-tight text-[#0f172a] lg:text-5xl">
                        Ansah Mbom Solange Niba
                    </h3>
                    <p className="mt-5 max-w-5xl text-lg leading-8 text-[#64748b]">
                        Ansah Mbom Solange Niba is a fashion entrepreneur with
                        over 10 years of experience in marketing and business
                        management. She is the founder and creative director of
                        DiensabyAnsah, a brand focused on designing and
                        producing off-the-rack and custom-made outfits for local
                        African and global markets.
                    </p>
                    <p className="mt-4 max-w-5xl text-lg leading-8 text-[#64748b]">
                        DiensabyAnsah currently has a showroom in Douala,
                        Bonapriso, Cameroon. Solange aspires to open business
                        incubators for youth entrepreneurs in fashion and other
                        sectors, creating apprenticeship pathways with industry
                        experts who can mentor them into becoming creative
                        designers, startup business owners, and managers.
                    </p>
                    <p className="mt-4 max-w-5xl text-lg leading-8 text-[#64748b]">
                        Her business drive and vision remain clear: "Africa
                        First" and "Made in Africa."
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 lg:px-10 lg:py-12 reveal-up">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight text-[#0f172a] sm:text-3xl">
                        Company Moments
                    </h3>
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-sm font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:text-[#9d7f14] hover:no-underline"
                    >
                        <Link href="/gallery">Open Gallery</Link>
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {gallery.map((image, index) => (
                        <div
                            key={index}
                            className="image-zoom relative h-56 overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]"
                        >
                            <Image
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                fill
                                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 48vw, 100vw"
                                className="object-cover object-top"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-5 lg:px-10 lg:pb-20 lg:pt-10 reveal-up">
                <div className="rounded-2xl border border-[#e2e8f0] bg-[#fcfcfb] px-4 pb-10 pt-12 text-center shadow-[0_18px_60px_-36px_rgba(15,23,42,0.32)] sm:px-8 sm:pb-12">
                    <h3 className="text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
                        Partner with the Future of African Luxury
                    </h3>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-[#94a3b8]">
                        Inquiries regarding industrial partnerships, wholesale,
                        and factory visits are handled by our concierge team.
                    </p>
                    <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            asChild
                            className="inline-flex h-12 items-center justify-center rounded-sm bg-[#0f172a] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#162544]"
                        >
                            <Link href="/contact">Request Info</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="inline-flex h-12 items-center justify-center rounded-sm border-[#d6dce5] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-[#0f172a]"
                        >
                            <Link href="/gallery">Explore Gallery</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
