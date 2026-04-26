import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

const pillars = [
    {
        title: "Our Factory",
        description:
            "Industrial scale meets artisanal precision in our state-of-the-art facility.",
        cta: "Discover Scale",
        image: "/pillar-1.png",
    },
    {
        title: "Ethical Sourcing",
        description:
            "Honoring the land through transparent and responsible supply chains.",
        cta: "Our Partners",
        image: "/pillar-2.png",
    },
    {
        title: "Skilled Craft",
        description:
            "Mastery passed down through generations, refined for the modern age.",
        cta: "Meet Artisans",
        image: "/pillar-3.png",
    },
];

const gallery = [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            <section className="mx-auto w-full max-w-7xl px-3 sm:px-5 pt-6 lg:px-10 lg:pt-8 reveal-up">
                <div className="relative overflow-hidden rounded-2xl image-zoom shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <div className="relative h-[36svh] min-h-72">
                        <Image
                            src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1900&q=80"
                            alt="Manufacturing and heritage"
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#0f2f44]/55" />
                    <div className="absolute inset-x-6 bottom-6 text-white lg:inset-x-10 lg:bottom-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                            Industrial Luxury
                        </p>
                        <h1 className="mt-2 text-5xl font-semibold leading-[0.95] tracking-tight lg:text-7xl">
                            Manufacturing
                            <br />
                            &amp; Heritage
                        </h1>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-3 py-12 sm:px-5 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-16 reveal-up">
                <div>
                    <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#0f172a] lg:text-6xl">
                        Made-in-Africa:
                        <br />
                        <span className="text-primary">The New Standard.</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-xl leading-9 text-[#64748b]">
                        Redefining industrial luxury through female-led
                        leadership and African excellence. Our facility is a
                        testament to the continent&apos;s rising manufacturing
                        prowess.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button
                            asChild
                            className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2937]"
                        >
                            <Link href="/contact">Explore The Hub</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 rounded-sm border-[#d6dce5] px-7 text-sm font-semibold uppercase tracking-[0.16em] text-[#0f172a]"
                        >
                            <Link href="/blog">View Process</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="image-zoom relative h-72 overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]">
                        <Image
                            src="/explore-1.png"
                            alt="Factory interior"
                            fill
                            sizes="(min-width: 1024px) 24vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="image-zoom relative h-72 overflow-hidden rounded-2xl shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)]">
                        <Image
                            src="/explore-2.png"
                            alt="Design and production"
                            fill
                            sizes="(min-width: 1024px) 24vw, 100vw"
                            className="object-cover"
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
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                            </div>
                            <h4 className="px-4 pt-1 text-3xl font-semibold text-[#0f172a]">
                                {pillar.title}
                            </h4>
                            <p className="px-4 text-lg leading-8 text-[#94a3b8]">
                                {pillar.description}
                            </p>
                            <CardContent className="mt-1 px-4 pb-4">
                                <Button
                                    asChild
                                    variant="link"
                                    className="h-auto p-0 text-sm font-semibold uppercase tracking-[0.15em] text-primary no-underline hover:no-underline"
                                >
                                    <Link href="/contact">{pillar.cta} →</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-10 lg:px-10 lg:py-12 reveal-up">
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
                    <Button
                        asChild
                        variant="link"
                        className="relative mt-8 inline-flex h-auto p-0 text-sm font-semibold uppercase tracking-[0.17em] text-[#0f172a] no-underline hover:no-underline"
                    >
                        <Link href="/blog">Read The Full Manifesto ⧉</Link>
                    </Button>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 sm:px-5 py-10 lg:px-10 lg:py-12 reveal-up">
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
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 sm:px-5 pb-16 pt-8 lg:px-10 lg:pb-20 lg:pt-10 reveal-up">
                <div className="rounded-2xl border border-[#e2e8f0] bg-[#fcfcfb] px-4 pb-10 pt-12 text-center shadow-[0_18px_60px_-36px_rgba(15,23,42,0.32)] sm:px-8 sm:pb-12">
                    <h3 className="text-5xl font-semibold tracking-tight text-[#0f172a]">
                        Partner with the Future
                    </h3>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-[#94a3b8]">
                        Inquiries regarding industrial partnerships, wholesale,
                        and factory visits are handled by our concierge team.
                    </p>
                    <form className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                        <Input
                            type="email"
                            placeholder="Email address"
                            className="h-12 flex-1 rounded-sm border border-[#e2e8f0] px-4 text-base"
                        />
                        <Button
                            type="submit"
                            className="inline-flex h-12 items-center justify-center rounded-sm bg-[#0f172a] px-8 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#162544]"
                        >
                            Request Info
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}
