import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

const featuredProducts = [
    {
        name: "Architectural Blazer",
        subtitle: "Limited Edition",
        price: "$740",
        image: "/featured-1.png",
    },
    {
        name: "Adire Evening Gown",
        subtitle: "Hand-dyed",
        price: "$1,250",
        image: "/featured-2.png",
    },
    {
        name: "Heritage Wrap Skirt",
        subtitle: "Contemporary Fit",
        price: "$420",
        image: "/featured-3.png",
    },
    {
        name: "Industrial Shift Dress",
        subtitle: "Signature Line",
        price: "$580",
        image: "/featured-4.png",
    },
];

const stats = [
    { value: "2012", label: "Established" },
    { value: "15+", label: "Countries" },
    { value: "250", label: "Artisans" },
];

export default function Home() {
    return (
        <div className="bg-white">
            <section className="relative min-h-[92svh] overflow-hidden bg-[#0f172a] reveal-up">
                <Image
                    src="/hero.jpg"
                    alt="Diensa hero"
                    fill
                    priority
                    sizes="100vw"
                    className="absolute inset-0 object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/55" />

                <div className="relative mx-auto flex w-full max-w-screen flex-col items-center px-5 py-20 text-center lg:px-10 lg:py-28">
                    <div className="max-w-5xl">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-primary">
                            Luxury Redefined
                        </p>
                        <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
                            Contemporary Heritage.
                            <br />
                            <span className="text-primary">
                                Industrial Ambition.
                            </span>
                        </h1>
                        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-white/80 md:text-2xl md:leading-10">
                            Experience the modern evolution of traditional Adire
                            textiles through architectural silhouettes and
                            ethical precision.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            className="h-12 rounded-sm bg-primary px-7 text-sm font-semibold uppercase tracking-[0.15em] text-[#1f2937] hover:opacity-90"
                        >
                            <Link href="/products">Shop New Arrivals</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 rounded-sm border-white/35 bg-transparent px-7 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:border-primary hover:bg-transparent hover:text-primary"
                        >
                            <Link href="/collections">The Collection</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-5 py-14 lg:px-10 lg:py-16 reveal-up">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-semibold tracking-tight text-[#0f172a]">
                            Featured Collection
                        </h2>
                        <p className="mt-1 text-base text-[#94a3b8]">
                            The 2024 Industrial Indigo Series
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-sm font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:text-[#9d7f14] hover:no-underline"
                    >
                        <Link href="/products">
                            View All <ArrowRight size={16} weight="bold" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                        <Card
                            key={product.name}
                            className="hover-lift gap-4 rounded-xl p-2 py-2 shadow-none ring-0"
                        >
                            <CardContent className="rounded-xl p-1.5">
                                <div className="image-zoom relative h-72 overflow-hidden rounded-lg">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="(min-width: 1024px) 23vw, (min-width: 640px) 48vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                            </CardContent>
                            <div className="flex items-start justify-between gap-4 px-2 pb-2">
                                <div>
                                    <h3 className="text-xl font-medium text-[#1e293b]">
                                        {product.name}
                                    </h3>
                                    <Badge
                                        variant="ghost"
                                        className="h-auto px-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]"
                                    >
                                        {product.subtitle}
                                    </Badge>
                                </div>
                                <p className="pt-1 text-lg font-semibold text-primary">
                                    {product.price}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="bg-[#f4f1e6] py-16 lg:py-20 reveal-up">
                <div className="mx-auto grid w-full max-w-screen gap-10 px-5 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-10">
                    <div className="relative">
                        <div className="image-zoom relative h-84 overflow-hidden rounded-2xl">
                            <Image
                                src="/factory.jpg"
                                alt="Diensa factory"
                                fill
                                sizes="(min-width: 1024px) 44vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="glass-panel hover-lift absolute -bottom-6 right-5 rounded-lg bg-primary/90 px-8 py-6 text-[#1f2937] shadow-lg">
                            <p className="text-5xl font-semibold leading-none">
                                100%
                            </p>
                            <p className="mt-1 text-sm font-semibold uppercase tracking-widest">
                                Female-led production facility
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                            Our Factory
                        </p>
                        <h2 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight text-[#0f172a]">
                            Manufacturing Excellence in Cameroon
                        </h2>
                        <p className="mt-6 text-xl leading-9 text-[#64748b]">
                            Diensa by Ansah is more than a fashion label; it is
                            an industrial catalyst. Our state-of-the-art
                            facility in Douala champions ethical production and
                            professional empowerment for female artisans.
                        </p>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="border-l border-primary/30 pl-4">
                                <h3 className="text-xl font-semibold text-[#0f172a]">
                                    Ethical Sourcing
                                </h3>
                                <p className="mt-1 text-base text-[#64748b]">
                                    Traceable materials from local cooperatives.
                                </p>
                            </div>
                            <div className="border-l border-primary/30 pl-4">
                                <h3 className="text-xl font-semibold text-[#0f172a]">
                                    Skilled Craft
                                </h3>
                                <p className="mt-1 text-base text-[#64748b]">
                                    Bridging traditional techniques with
                                    industrial precision.
                                </p>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="link"
                            className="mt-8 h-auto p-0 text-sm font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:text-[#9d7f14] hover:no-underline"
                        >
                            <Link href="/about">
                                Discover Our Impact
                                <ArrowRight size={16} weight="bold" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-5 py-24 text-center lg:px-10 lg:py-32 reveal-up">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-primary">
                    The Diensa Story
                </p>
                <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0f172a] md:text-7xl">
                    From Boutique Charm to Industrial Scale
                </h2>
                <p className="mx-auto mt-8 max-w-4xl text-xl leading-9 text-[#94a3b8]">
                    Founded with a vision to globalize West African aesthetics,
                    Diensa by Ansah has transitioned from a bespoke boutique to
                    an industrial-scale fashion house. Our journey is rooted in
                    the belief that African heritage deserves a seat at the
                    table of global luxury, backed by the power of sustainable
                    industrialization.
                </p>

                <div className="mt-14 flex flex-wrap items-center justify-center gap-12 md:gap-16">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="hover-lift rounded-xl px-5 py-4"
                        >
                            <p className="text-5xl font-semibold text-[#0f172a]">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-5 pb-20 lg:px-10 lg:pb-24 reveal-up">
                <div className="glass-panel hover-lift rounded-3xl bg-[#f4edcf]/88 px-8 py-12 md:px-12 md:py-14">
                    <h2 className="text-5xl font-semibold tracking-tight text-[#0f172a]">
                        Join the Inner Circle
                    </h2>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-[#94a3b8]">
                        Receive early access to seasonal collections,
                        manufacturing insights, and archival stories.
                    </p>

                    <form className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
                        <Input
                            type="email"
                            placeholder="Your email address"
                            className="h-12 flex-1 rounded-sm border border-[#e2e8f0] bg-white px-4 text-base text-[#0f172a]"
                        />
                        <Button
                            type="submit"
                            className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-8 text-sm font-semibold uppercase tracking-[0.15em] text-[#1f2937] hover:opacity-90"
                        >
                            Subscribe
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}
