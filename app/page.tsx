import { AnimatedStats } from "@/components/animated-stats";
import { HeroVideo } from "@/components/hero-video";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    getWooCommerceCollections,
    getWooCommerceProducts,
} from "@/lib/woocommerce";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const stats = [
    { value: "2012", label: "Established" },
    { value: "15+", label: "Countries" },
    { value: "250", label: "Artisans" },
];

export default function Home() {
    return (
        <div className="bg-white">
            <section className="relative min-h-[84svh] overflow-hidden bg-[#0f172a] reveal-up sm:min-h-[92svh]">
                <HeroVideo playbackRate={0.5} />
                <div className="absolute inset-0 bg-black/55" />

                <div className="relative mx-auto flex w-full max-w-screen flex-col items-center px-3 py-16 text-center sm:px-5 sm:py-20 lg:px-10 lg:py-28">
                    <div className="max-w-5xl">
                        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-primary">
                            Luxury Redefined
                        </p>
                        <h1 className="text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">
                            Contemporary Heritage.
                            <br />
                            <span className="text-primary">
                                Industrial Ambition.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-white/80 sm:mt-8 sm:text-lg sm:leading-8 md:text-2xl md:leading-10">
                            Experience the modern evolution of traditional Adire
                            textiles through architectural silhouettes and
                            ethical precision.
                        </p>
                    </div>

                    <div className="mt-8 flex w-full max-w-sm flex-wrap items-center justify-center gap-3 sm:mt-10 sm:max-w-none sm:gap-4">
                        <Button
                            asChild
                            className="h-12 w-full rounded-sm bg-primary px-7 text-sm font-semibold uppercase tracking-[0.15em] text-[#1f2937] hover:opacity-90 sm:w-auto"
                        >
                            <Link href="/products">Shop New Arrivals</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 w-full rounded-sm border-white/35 bg-transparent px-7 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:border-primary hover:bg-transparent hover:text-primary sm:w-auto"
                        >
                            <Link href="/collections">The Collection</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Suspense fallback={<FeaturedCollectionFallback />}>
                <FeaturedCollectionSection />
            </Suspense>

            <section className="bg-[#f4f1e6] py-12 sm:py-16 lg:py-20 reveal-up">
                <div className="mx-auto grid w-full max-w-7xl gap-8 px-3 sm:gap-10 sm:px-5 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-10">
                    <div className="relative">
                        <div className="image-zoom relative h-64 overflow-hidden rounded-2xl sm:h-96">
                            <Image
                                src="/factory.jpg"
                                alt="Diensa factory"
                                fill
                                sizes="(min-width: 1024px) 44vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="glass-panel hover-lift absolute -bottom-5 right-3 rounded-lg bg-primary/90 px-5 py-4 text-[#1f2937] shadow-lg sm:-bottom-6 sm:right-5 sm:px-8 sm:py-6">
                            <p className="text-3xl font-semibold leading-none sm:text-5xl">
                                100%
                            </p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-sm sm:tracking-widest">
                                Female-led production facility
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                            Our Factory
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-tight text-[#0f172a] sm:text-5xl">
                            Manufacturing Excellence in Cameroon
                        </h2>
                        <p className="mt-5 text-base leading-7 text-[#64748b] sm:mt-6 sm:text-xl sm:leading-9">
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

            <section className="mx-auto w-full max-w-screen px-3 py-16 text-center sm:px-5 sm:py-24 lg:px-10 lg:py-32 reveal-up">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-primary">
                    The Diensa Story
                </p>
                <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-[1.03] tracking-tight text-[#0f172a] sm:mt-5 sm:text-5xl md:text-7xl">
                    From Boutique Charm to Industrial Scale
                </h2>
                <p className="mx-auto mt-6 max-w-4xl text-base leading-7 text-[#94a3b8] sm:mt-8 sm:text-xl sm:leading-9">
                    Founded with a vision to globalize West African aesthetics,
                    Diensa by Ansah has transitioned from a bespoke boutique to
                    an industrial-scale fashion house. Our journey is rooted in
                    the belief that African heritage deserves a seat at the
                    table of global luxury, backed by the power of sustainable
                    industrialization.
                </p>

                <AnimatedStats stats={stats} />
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 pb-16 sm:px-5 sm:pb-20 lg:px-10 lg:pb-24 reveal-up">
                <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-[#e9dfbb] bg-[#f4edcf]/88 px-4 py-8 text-center shadow-[0_18px_60px_-36px_rgba(15,23,42,0.32)] sm:rounded-3xl sm:px-8 sm:py-12 md:px-12 md:py-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                        Private Access
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
                        Join the Inner Circle
                    </h2>
                    <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-[#94a3b8] sm:mt-4 sm:text-lg sm:leading-8">
                        Receive early access to seasonal collections,
                        manufacturing insights, and archival stories.
                    </p>

                    <form className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
                        <Input
                            type="email"
                            placeholder="Your email address"
                            className="h-12 flex-1 rounded-xl border border-[#e2e8f0] bg-white px-4 text-base text-[#0f172a]"
                        />
                        <Button
                            type="submit"
                            className="inline-flex h-12 w-full items-center justify-center rounded-sm bg-primary px-8 text-sm font-semibold uppercase tracking-[0.15em] text-[#1f2937] hover:opacity-90 sm:w-auto"
                        >
                            Subscribe
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}

async function FeaturedCollectionSection() {
    const [products, collections] = await Promise.all([
        getWooCommerceProducts({ limit: 40 }),
        getWooCommerceCollections(),
    ]);

    const featuredCollection =
        collections.find(
            (collection) => collection.featured && collection.productCount > 0,
        ) ?? collections.find((collection) => collection.productCount > 0);

    const featuredCollectionProducts = featuredCollection
        ? products
              .filter((product) =>
                  product.collections.includes(featuredCollection.name),
              )
              .sort((a, b) => b.productId - a.productId)
              .slice(0, 4)
        : products.sort((a, b) => b.productId - a.productId).slice(0, 4);

    const featuredCollectionHref = featuredCollection
        ? `/products?collection=${encodeURIComponent(featuredCollection.name)}`
        : "/products";

    return (
        <section className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-5 sm:py-14 lg:px-10 lg:py-16 reveal-up">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                        Featured Collection
                    </h2>
                    <p className="mt-1 text-base text-[#94a3b8]">
                        {featuredCollection?.name ?? "Curated Selection"}
                    </p>
                </div>
                <Button
                    asChild
                    variant="link"
                    className="h-auto p-0 text-sm font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:text-[#9d7f14] hover:no-underline"
                >
                    <Link href={featuredCollectionHref}>
                        View All <ArrowRight size={16} weight="bold" />
                    </Link>
                </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCollectionProducts.map((product) => (
                    <Card
                        key={product.id}
                        className="group mx-auto w-full max-w-80 gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]"
                    >
                        <Link
                            href={`/products/${product.id}`}
                            className="block"
                        >
                            <CardContent className="space-y-2 px-0 py-0">
                                <div className="image-zoom relative h-64 overflow-hidden rounded-t-2xl bg-[#f8fafc] sm:h-72">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="(min-width: 1024px) 23vw, (min-width: 640px) 48vw, 100vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                        unoptimized
                                    />
                                    <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#334155] backdrop-blur-sm">
                                        {product.collections[0] || "Diensa"}
                                    </span>
                                    <span
                                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/90 text-[#334155] backdrop-blur-sm"
                                        aria-hidden="true"
                                    >
                                        <ArrowRight size={14} weight="bold" />
                                    </span>
                                </div>
                            </CardContent>
                            <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-3 sm:gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-[#0f172a] transition-colors group-hover:text-primary">
                                        {product.name}
                                    </h3>
                                    <p className="line-clamp-2 pt-1 text-sm text-[#64748b]">
                                        {product.note}
                                    </p>
                                    <p className="pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] transition-colors group-hover:text-primary">
                                        View details
                                    </p>
                                </div>
                                <p className="shrink-0 whitespace-nowrap pt-1 text-base font-semibold text-primary sm:text-lg">
                                    {product.price}
                                </p>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function FeaturedCollectionFallback() {
    return (
        <section
            className="mx-auto w-full max-w-screen px-3 py-12 sm:px-5 sm:py-14 lg:px-10 lg:py-16 reveal-up"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end sm:gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                        Featured Collection
                    </h2>
                    <p className="mt-1 text-base text-[#94a3b8]">
                        Loading featured products...
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    Loading
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card
                        key={`featured-loading-${index}`}
                        className="mx-auto w-full max-w-80 gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]"
                    >
                        <CardContent className="space-y-2 px-0 py-0">
                            <div className="relative h-64 animate-pulse overflow-hidden rounded-t-2xl bg-[#eef2f7] sm:h-72" />
                        </CardContent>
                        <div className="px-4 pb-4 pt-3">
                            <div className="h-5 w-2/3 animate-pulse rounded bg-[#eef2f7]" />
                            <div className="mt-2 h-4 w-11/12 animate-pulse rounded bg-[#f1f5f9]" />
                            <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-[#f1f5f9]" />
                            <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-[#e2e8f0]" />
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
