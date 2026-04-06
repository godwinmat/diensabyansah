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
            <section className="mx-auto w-full max-w-screen px-3 pb-8 pt-6 sm:px-5 lg:px-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-xl">
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

            <section className="mx-auto w-full max-w-375 px-3 pb-16 sm:px-5 lg:px-10 lg:pb-20 reveal-up">
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
                                className="hover-lift mx-auto w-full max-w-90 gap-3 rounded-none bg-white/80 p-2 py-2 shadow-none ring-0"
                            >
                                <Link
                                    href={`/products?collection=${encodeURIComponent(collection.name)}`}
                                    className="group block"
                                >
                                    <div className="image-zoom relative aspect-4/5 overflow-hidden">
                                        <Image
                                            src={collection.previewImage}
                                            alt={collection.name}
                                            fill
                                            unoptimized
                                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                                            className="object-cover"
                                        />
                                    </div>

                                    <CardContent className="space-y-1 px-0 pb-1 pt-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-[18px] font-semibold text-[#1e293b] transition-colors group-hover:text-primary">
                                                {collection.name}
                                            </h2>
                                            <p className="text-sm font-semibold text-primary">
                                                {collection.productCount}
                                            </p>
                                        </div>
                                        <p className="line-clamp-2 text-sm text-[#64748b]">
                                            {collection.description ||
                                                "Discover curated pieces from this collection."}
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
