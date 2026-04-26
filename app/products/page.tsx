import { ProductsRefreshButton } from "@/components/products-refresh-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getWooCommerceProducts } from "@/lib/woocommerce";
import Image from "next/image";
import Link from "next/link";

type ProductsPageProps = {
    searchParams?:
        | Promise<{
              collection?: string;
              size?: string;
              q?: string;
              page?: string;
          }>
        | {
              collection?: string;
              size?: string;
              q?: string;
              page?: string;
          };
};

const PRODUCTS_PER_PAGE = 6;

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const selectedCollection = resolvedSearchParams?.collection?.trim() ?? "";
    const selectedSize = resolvedSearchParams?.size?.trim() ?? "";
    const selectedQuery = resolvedSearchParams?.q?.trim() ?? "";
    const normalizedQuery = selectedQuery.toLowerCase();
    const requestedPage = Number.parseInt(
        resolvedSearchParams?.page ?? "1",
        10,
    );
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
        const matchesSearch =
            normalizedQuery.length === 0 ||
            product.name.toLowerCase().includes(normalizedQuery) ||
            product.note.toLowerCase().includes(normalizedQuery) ||
            product.collections.some((collection) =>
                collection.toLowerCase().includes(normalizedQuery),
            );

        return matchesCollection && matchesSize && matchesSearch;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
    );
    const currentPage = Number.isFinite(requestedPage)
        ? Math.min(Math.max(requestedPage, 1), totalPages)
        : 1;
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + PRODUCTS_PER_PAGE,
    );

    const buildProductsHref = ({
        collection,
        size,
        query,
        page,
    }: {
        collection?: string;
        size?: string;
        query?: string;
        page?: number;
    }) => {
        const params = new URLSearchParams();

        if (collection && collection.trim().length > 0) {
            params.set("collection", collection);
        }

        if (size && size.trim().length > 0) {
            params.set("size", size);
        }

        if (query && query.trim().length > 0) {
            params.set("q", query);
        }

        if (page && page > 1) {
            params.set("page", String(page));
        }

        const hrefQuery = params.toString();
        return hrefQuery ? `/products?${hrefQuery}` : "/products";
    };

    const pageStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
    const pageEnd = Math.min(
        startIndex + PRODUCTS_PER_PAGE,
        filteredProducts.length,
    );

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
            <section className="mx-auto w-full max-w-7xl px-3 pb-8 pt-6 sm:px-5 lg:px-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
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
                    <div className="absolute inset-x-4 bottom-8 text-white sm:inset-x-6 lg:inset-x-10 lg:bottom-10">
                        <Badge className="h-auto bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#1f2937]">
                            New Season
                        </Badge>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            {randomCollection ||
                                "2026 Industrial Indigo Series"}
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85 lg:text-base lg:leading-7">
                            A curated selection of structural silhouettes and
                            hand-crafted Adire techniques.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-8 px-3 sm:px-5 pb-16 lg:grid-cols-[260px_1fr] lg:px-10 lg:pb-20 reveal-up">
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
                                        href={buildProductsHref({
                                            size: selectedSize,
                                            query: selectedQuery,
                                        })}
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
                                            href={buildProductsHref({
                                                collection,
                                                size: selectedSize,
                                                query: selectedQuery,
                                            })}
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
                                    href={buildProductsHref({
                                        collection: selectedCollection,
                                        query: selectedQuery,
                                    })}
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
                                        href={buildProductsHref({
                                            size,
                                            collection: selectedCollection,
                                            query: selectedQuery,
                                        })}
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
                            <span className="font-semibold">{pageStart}</span>-
                            <span className="font-semibold">{pageEnd}</span> of{" "}
                            <span className="font-semibold">
                                {filteredProducts.length}
                            </span>{" "}
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
                                Try a different search term, collection, or
                                size.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="group mx-auto w-full max-w-80 gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]"
                                    >
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="block"
                                        >
                                            <div className="image-zoom relative aspect-4/5 overflow-hidden rounded-t-2xl bg-[#f8fafc]">
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    width={640}
                                                    height={800}
                                                    unoptimized
                                                    className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                />
                                                <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#334155] backdrop-blur-sm">
                                                    {product.collections[0] ||
                                                        "Diensa"}
                                                </span>
                                            </div>
                                            <CardContent className="space-y-2 px-4 pb-4 pt-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-[#0f172a] transition-colors group-hover:text-primary">
                                                        {product.name}
                                                    </h3>
                                                    <p className="shrink-0 text-lg font-semibold text-primary">
                                                        {product.price}
                                                    </p>
                                                </div>
                                                <p className="line-clamp-2 text-sm text-[#64748b]">
                                                    {product.note}
                                                </p>
                                                <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] transition-colors group-hover:text-primary">
                                                    View details
                                                </p>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>

                            {totalPages > 1 ? (
                                <nav
                                    className="mt-8 flex flex-wrap items-center justify-center gap-2"
                                    aria-label="Products pagination"
                                >
                                    <Link
                                        href={buildProductsHref({
                                            collection: selectedCollection,
                                            size: selectedSize,
                                            query: selectedQuery,
                                            page: currentPage - 1,
                                        })}
                                        aria-disabled={currentPage === 1}
                                        className={
                                            currentPage === 1
                                                ? "pointer-events-none rounded-sm border border-[#dce4ed] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]"
                                                : "rounded-sm border border-[#dce4ed] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] hover:border-primary hover:text-primary"
                                        }
                                    >
                                        Previous
                                    </Link>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => {
                                            const page = index + 1;

                                            return (
                                                <Link
                                                    key={`products-page-${page}`}
                                                    href={buildProductsHref({
                                                        collection:
                                                            selectedCollection,
                                                        size: selectedSize,
                                                        query: selectedQuery,
                                                        page,
                                                    })}
                                                    aria-current={
                                                        currentPage === page
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    className={
                                                        currentPage === page
                                                            ? "rounded-sm border border-primary bg-primary/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
                                                            : "rounded-sm border border-[#dce4ed] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] hover:border-primary hover:text-primary"
                                                    }
                                                >
                                                    {page}
                                                </Link>
                                            );
                                        },
                                    )}

                                    <Link
                                        href={buildProductsHref({
                                            collection: selectedCollection,
                                            size: selectedSize,
                                            query: selectedQuery,
                                            page: currentPage + 1,
                                        })}
                                        aria-disabled={
                                            currentPage === totalPages
                                        }
                                        className={
                                            currentPage === totalPages
                                                ? "pointer-events-none rounded-sm border border-[#dce4ed] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]"
                                                : "rounded-sm border border-[#dce4ed] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#334155] hover:border-primary hover:text-primary"
                                        }
                                    >
                                        Next
                                    </Link>
                                </nav>
                            ) : null}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
