import { ProductsRefreshButton } from "@/components/products-refresh-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getWooCommerceProducts } from "@/lib/woocommerce";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

type ProductsPageProps = {
    searchParams?:
        | Promise<{
              collection?: string;
              size?: string;
          }>
        | {
              collection?: string;
              size?: string;
          };
};

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const selectedCollection = resolvedSearchParams?.collection?.trim() ?? "";
    const selectedSize = resolvedSearchParams?.size?.trim() ?? "";
    const products = await getWooCommerceProducts();

    const collectionOptions = Array.from(
        new Set(products.flatMap((product) => product.collections)),
    ).sort((a, b) => a.localeCompare(b));

    const sizeOptions = Array.from(
        new Set(products.flatMap((product) => product.sizes)),
    ).sort((a, b) => a.localeCompare(b));

    const filteredProducts = products.filter((product) => {
        const matchesCollection =
            selectedCollection.length === 0 ||
            product.collections.includes(selectedCollection);
        const matchesSize =
            selectedSize.length === 0 || product.sizes.includes(selectedSize);

        return matchesCollection && matchesSize;
    });

    const countLabel =
        filteredProducts.length === products.length
            ? `${products.length}`
            : `${filteredProducts.length} of ${products.length}`;

    // Get random collection with products and its most recent product
    const collectionsWithProducts = collectionOptions.filter(
        (collection) =>
            products.filter((p) => p.collections.includes(collection)).length >
            0,
    );
    const randomCollection =
        collectionsWithProducts.length > 0
            ? collectionsWithProducts[
                  Math.floor(Math.random() * collectionsWithProducts.length)
              ]
            : null;
    const heroProduct = randomCollection
        ? products
              .filter((p) => p.collections.includes(randomCollection))
              .sort(
                  (a, b) =>
                      (parseInt(String(b.id)) || 0) -
                      (parseInt(String(a.id)) || 0),
              )[0]
        : null;
    const heroImage =
        heroProduct?.image ||
        "https://images.unsplash.com/photo-1615212814093-4f4c0ca0d7f5?auto=format&fit=crop&w=1800&q=80";

    return (
        <div className="bg-white">
            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 pb-8 pt-6 lg:px-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-xl">
                    <div className="relative h-[32svh] min-h-64">
                        <Image
                            src={heroImage}
                            alt={randomCollection || "Diensa collection"}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#0f2138]/55" />
                    <div className="absolute inset-x-3 sm:inset-x-6 text-white lg:inset-x-10 bottom-10">
                        <Badge className="h-auto bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#1f2937]">
                            New Season
                        </Badge>
                        <h1 className="mt-3 text-5xl font-semibold tracking-tight lg:text-6xl">
                            {randomCollection ||
                                "2026 Industrial Indigo Series"}
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm text-white/85 lg:text-base">
                            A curated selection of structural silhouettes and
                            hand-crafted Adire techniques.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-375 gap-8 px-3 sm:px-5 pb-16 lg:grid-cols-[260px_1fr] lg:px-10 lg:pb-20 reveal-up">
                <aside className="glass-panel h-fit rounded-xl bg-white/70 p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Filters
                    </p>
                    <div className="mt-5 space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-[#1e293b]">
                                Collection
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge
                                    asChild
                                    className={
                                        selectedCollection.length === 0
                                            ? "bg-primary text-[#1f2937] hover:bg-primary"
                                            : ""
                                    }
                                    variant={
                                        selectedCollection.length === 0
                                            ? "default"
                                            : "outline"
                                    }
                                >
                                    <Link
                                        href={
                                            selectedSize
                                                ? `/products?size=${encodeURIComponent(selectedSize)}`
                                                : "/products"
                                        }
                                    >
                                        All Pieces
                                    </Link>
                                </Badge>
                                {collectionOptions.map((collection) => (
                                    <Badge
                                        key={collection}
                                        asChild
                                        variant={
                                            selectedCollection === collection
                                                ? "default"
                                                : "outline"
                                        }
                                        className={
                                            selectedCollection === collection
                                                ? "bg-primary text-[#1f2937] hover:bg-primary"
                                                : ""
                                        }
                                    >
                                        <Link
                                            href={`/products?collection=${encodeURIComponent(collection)}${selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ""}`}
                                        >
                                            {collection}
                                        </Link>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#1e293b]">
                                Size
                            </p>
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                                <Link
                                    href={
                                        selectedCollection
                                            ? `/products?collection=${encodeURIComponent(selectedCollection)}`
                                            : "/products"
                                    }
                                    className={
                                        selectedSize.length === 0
                                            ? "rounded-sm border border-primary bg-primary/12 py-2 font-semibold text-primary"
                                            : "rounded-sm border border-[#dce4ed] bg-white py-2"
                                    }
                                >
                                    All
                                </Link>
                                {sizeOptions.map((size) => (
                                    <Link
                                        key={size}
                                        href={`/products?size=${encodeURIComponent(size)}${selectedCollection ? `&collection=${encodeURIComponent(selectedCollection)}` : ""}`}
                                        className={
                                            selectedSize === size
                                                ? "rounded-sm border border-primary bg-primary/12 py-2 font-semibold text-primary"
                                                : "rounded-sm border border-[#dce4ed] bg-white py-2"
                                        }
                                    >
                                        {size}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div>
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <p className="text-sm text-[#64748b]">
                            Showing{" "}
                            <span className="font-semibold">{countLabel}</span>{" "}
                            curated pieces
                        </p>
                        <ProductsRefreshButton />
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#dce4ed] bg-white/70 px-6 py-14 text-center text-[#64748b]">
                            <p className="text-lg font-semibold text-[#1e293b]">
                                No products match this filter.
                            </p>
                            <p className="mt-2 text-sm">
                                Try another collection or size.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="hover-lift mx-auto w-full max-w-80 gap-4 rounded-none bg-white/80 p-2 py-2 shadow-none ring-0"
                                >
                                    <Link
                                        href={`/products/${product.id}`}
                                        className="group block"
                                    >
                                        <div className="image-zoom relative aspect-4/5 overflow-hidden">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={640}
                                                height={800}
                                                unoptimized
                                                className="block h-full w-full object-cover"
                                            />
                                            <span
                                                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#334155]"
                                                aria-hidden="true"
                                            >
                                                <Heart
                                                    size={16}
                                                    weight="regular"
                                                />
                                            </span>
                                        </div>
                                        <CardContent className="space-y-1 px-0 py-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-[16px] font-semibold text-[#1e293b] transition-colors group-hover:text-primary">
                                                    {product.name}
                                                </h3>
                                                <p className="text-lg font-semibold text-primary">
                                                    {product.price}
                                                </p>
                                            </div>
                                            <p className="text-sm text-[#64748b]">
                                                {product.note}
                                            </p>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
