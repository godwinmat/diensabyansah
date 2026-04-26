import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    getWooCommerceCollections,
    getWooCommerceProducts,
} from "@/lib/woocommerce";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export default async function CollectionsPage() {
    const [collections, products] = await Promise.all([
        getWooCommerceCollections(),
        getWooCommerceProducts(),
    ]);

    const nonEmptyCollections = collections
        .filter((collection) => collection.productCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    const collectionsWithPreview = nonEmptyCollections.map((collection) => {
        const latestProduct = products
            .filter((product) => product.collections.includes(collection.name))
            .sort((a, b) => b.productId - a.productId)[0];

        return {
            ...collection,
            previewImage: latestProduct?.image ?? collection.image,
        };
    });

    return (
        <div className="bg-white">
            <section className="mx-auto w-full max-w-7xl px-3 pb-8 pt-6 sm:px-5 lg:px-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <div className="relative h-[30svh] min-h-56 sm:h-[36svh]">
                        <Image
                            src="/collection.jpg"
                            alt="Diensa collections"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#0f2138]/55" />
                    <div className="absolute inset-x-3 bottom-8 text-white sm:inset-x-6 lg:inset-x-10">
                        <Badge className="h-auto bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#1f2937]">
                            Collections
                        </Badge>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Explore Every Collection
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm text-white/85 lg:text-base">
                            Browse all available categories curated from our
                            latest WordPress catalog.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 pb-16 sm:px-5 lg:px-10 lg:pb-20 reveal-up">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#64748b]">
                        Showing{" "}
                        <span className="font-semibold">
                            {collectionsWithPreview.length}
                        </span>{" "}
                        collections
                    </p>
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-sm font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:text-[#9d7f14] hover:no-underline"
                    >
                        <Link href="/products">
                            View Products <ArrowRight size={16} weight="bold" />
                        </Link>
                    </Button>
                </div>

                {collectionsWithPreview.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#dce4ed] bg-white/70 px-6 py-14 text-center text-[#64748b]">
                        <p className="text-lg font-semibold text-[#1e293b]">
                            No collections available yet.
                        </p>
                        <p className="mt-2 text-sm">
                            Add product categories in WordPress to populate this
                            page.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {collectionsWithPreview.map((collection) => (
                            <Card
                                key={collection.id}
                                className="group mx-auto w-full max-w-90 gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]"
                            >
                                <Link
                                    href={`/products?collection=${encodeURIComponent(collection.name)}`}
                                    className="group block"
                                >
                                    <div className="image-zoom relative aspect-4/5 overflow-hidden rounded-t-2xl bg-[#f8fafc]">
                                        <Image
                                            src={collection.previewImage}
                                            alt={collection.name}
                                            fill
                                            unoptimized
                                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                        />
                                        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#334155] backdrop-blur-sm">
                                            {collection.productCount} pieces
                                        </span>
                                    </div>

                                    <CardContent className="space-y-2 px-4 pb-4 pt-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-[18px] font-semibold leading-tight text-[#1e293b] transition-colors group-hover:text-primary">
                                                {collection.name}
                                            </h2>
                                            <ArrowRight
                                                size={16}
                                                weight="bold"
                                                className="mt-1 shrink-0 text-[#94a3b8] transition-colors group-hover:text-primary"
                                            />
                                        </div>
                                        <p className="line-clamp-2 text-sm text-[#64748b]">
                                            {collection.description ||
                                                "Discover curated pieces from this collection."}
                                        </p>
                                        <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] transition-colors group-hover:text-primary">
                                            View collection
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
