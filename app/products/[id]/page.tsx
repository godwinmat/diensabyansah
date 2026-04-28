import { ProductSizeAddToCart } from "@/components/product-size-add-to-cart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    getWooCommerceProductById,
    getWooCommerceProducts,
} from "@/lib/woocommerce";
import {
    ArrowLeft,
    GlobeHemisphereWest,
    Scales,
    Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProductDetailPageProps = {
    params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { id } = await params;
    const product = await getWooCommerceProductById(id);

    if (!product) {
        notFound();
    }

    const allProducts = await getWooCommerceProducts();
    const completeTheLook = allProducts
        .filter((item) => item.id !== product.id)
        .slice(0, 3);
    const productCollections = product.collections.length
        ? product.collections
        : ["Uncategorized"];
    const productSizes = product.sizes;
    const galleryImages = product.galleryImages;
    const hasGalleryImages = galleryImages.length > 0;
    const mainImage = galleryImages[0] ?? product.image ?? "";
    const thumbImages = galleryImages.slice(1, 5);

    return (
        <article className="bg-[#f4f4f3]">
            <section className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 lg:px-10 lg:pt-8 reveal-up">
                <Link
                    href="/products"
                    className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b] transition-colors hover:text-primary"
                >
                    <ArrowLeft size={14} weight="bold" />
                    Back to products
                </Link>

                <div
                    className={
                        hasGalleryImages
                            ? "grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start"
                            : "grid gap-8"
                    }
                >
                    {hasGalleryImages ? (
                        <div>
                            <div className="image-zoom relative h-[70svh] min-h-110 overflow-hidden rounded-2xl bg-[#efefef] shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 56vw, 100vw"
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {thumbImages.length > 0 ? (
                                <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
                                    {thumbImages.map((image, index) => (
                                        <div
                                            key={`${image}-${index}`}
                                            className="image-zoom relative h-28 overflow-hidden rounded-xl bg-[#efefef] shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.name} detail ${index + 2}`}
                                                fill
                                                sizes="(min-width: 1024px) 14vw, 25vw"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="reveal-up">
                        <div className="rounded-2xl border border-[#e2e8f0] bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
                            <div className="flex flex-wrap gap-2">
                                {productCollections.map((collection) => (
                                    <Badge
                                        key={collection}
                                        variant="outline"
                                        className="h-auto border-[#dce4ed] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#334155]"
                                    >
                                        {collection}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-tight text-[#1e293b] lg:text-6xl">
                                {product.name}
                            </h1>

                            <div className="mt-4 flex items-center gap-3">
                                <p className="text-2xl font-semibold text-primary sm:text-3xl">
                                    {product.price}
                                </p>
                            </div>

                            <p className="mt-4 text-base leading-8 text-[#64748b] sm:text-lg">
                                {product.description}
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-[#e2e8f0] bg-[#fcfcfb] p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                        Material
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[#1e293b]">
                                        {product.material}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#e2e8f0] bg-[#fcfcfb] p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                        Origin
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[#1e293b]">
                                        {product.origin}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#e2e8f0] bg-[#fcfcfb] p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                        Fit
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[#1e293b]">
                                        Structured silhouette
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-[#e2e8f0] pt-6">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                    Sizes
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {productSizes.length > 0 ? (
                                        productSizes.map((size) => (
                                            <Badge
                                                key={size}
                                                variant="outline"
                                                className="h-auto rounded-full border-[#dce4ed] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#334155]"
                                            >
                                                {size}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#94a3b8]">
                                            No sizes configured for this
                                            product.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <ProductSizeAddToCart
                                productId={product.productId}
                                sizes={productSizes}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-10 lg:py-14 reveal-up">
                <div className="grid gap-10 border-t border-[#e4e7ea] pt-10 lg:grid-cols-[1fr_1fr] lg:items-center">
                    <div>
                        <h2 className="text-4xl font-semibold tracking-tight text-[#1e293b] sm:text-5xl">
                            The Story of the Fabric
                        </h2>
                        <p className="mt-5 max-w-2xl text-lg leading-9 text-[#64748b]">
                            Adire is the indigo-dyed cloth made by Yoruba women
                            in southwestern Nigeria, using a variety of
                            resist-dyeing techniques. Each garment preserves
                            centuries-old craft while embracing modern
                            silhouettes.
                        </p>
                        <p className="mt-4 max-w-2xl text-lg leading-9 text-[#64748b]">
                            This edition features a geometric pattern inspired
                            by modernist grids, blending heritage resistance
                            techniques with contemporary linear aesthetics.
                        </p>

                        <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                                <p className="text-3xl font-semibold text-primary">
                                    14
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                    Days to dye
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                                <p className="text-3xl font-semibold text-primary">
                                    100%
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                    Organic Indigo
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="image-zoom relative h-96 overflow-hidden rounded-2xl bg-[#efefef] shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:h-110">
                        <Image
                            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"
                            alt="Adire craft process"
                            fill
                            sizes="(min-width: 1024px) 44vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 py-8 text-center lg:px-10 lg:py-12 reveal-up">
                <h2 className="text-4xl font-semibold text-[#1e293b] sm:text-5xl">
                    Manufacturing Excellence
                </h2>
                <p className="mx-auto mt-4 max-w-4xl text-lg leading-8 text-[#64748b]">
                    Crafted at our dedicated atelier in Douala, Cameroon. Every
                    garment is ethically sourced and provides sustainable
                    livelihoods for over 40 master artisans.
                </p>

                <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#e2e8f0] bg-white/80 p-5">
                        <div className="flex flex-col items-center gap-2">
                            <Sparkle size={24} className="text-[#64748b]" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                Ethically Sourced
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-white/80 p-5">
                        <div className="flex flex-col items-center gap-2">
                            <GlobeHemisphereWest
                                size={24}
                                className="text-[#64748b]"
                            />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                Made in Cameroon
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-white/80 p-5">
                        <div className="flex flex-col items-center gap-2">
                            <Scales size={24} className="text-[#64748b]" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                Industrial Precision
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-10 lg:px-10 lg:pb-20 reveal-up">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                    Complete the look
                </p>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    {completeTheLook.map((item) => (
                        <Card
                            key={item.id}
                            className="group mx-auto w-full max-w-80 gap-0 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white py-0 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)]"
                        >
                            <Link
                                href={`/products/${item.id}`}
                                className="block"
                            >
                                <div className="image-zoom relative aspect-4/5 overflow-hidden rounded-t-2xl bg-[#f8fafc]">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={640}
                                        height={800}
                                        unoptimized
                                        className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                    />
                                    <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#334155] backdrop-blur-sm">
                                        {item.collections[0] || "Diensa"}
                                    </span>
                                </div>
                                <CardContent className="space-y-2 px-4 pb-4 pt-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-[#0f172a] transition-colors group-hover:text-primary">
                                            {item.name}
                                        </h3>
                                        <p className="shrink-0 text-lg font-semibold text-primary">
                                            {item.price}
                                        </p>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-[#64748b]">
                                        {item.note}
                                    </p>
                                    <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8] transition-colors group-hover:text-primary">
                                        View details
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>
        </article>
    );
}
