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

export async function generateStaticParams() {
    const products = await getWooCommerceProducts();

    return products.map((product) => ({ id: product.id }));
}

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
    const mainImage = galleryImages[0] ?? "";
    const thumbImages = galleryImages.slice(1);

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
                            <div className="image-zoom relative h-[70svh] min-h-110 overflow-hidden rounded-sm bg-[#efefef]">
                                <Image
                                    src={mainImage}
                                    alt={product.name}
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 56vw, 100vw"
                                    className="object-cover"
                                />
                            </div>

                            {thumbImages.length > 0 ? (
                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    {thumbImages.map((image, index) => (
                                        <div
                                            key={`${image}-${index}`}
                                            className="image-zoom relative h-28 overflow-hidden rounded-sm bg-[#efefef]"
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.name} detail ${index + 2}`}
                                                fill
                                                sizes="(min-width: 1024px) 14vw, 25vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="reveal-up">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                            Shop / Tailoring / Blazers
                        </p>
                        <h1 className="mt-2 text-5xl font-semibold leading-[1.02] tracking-tight text-[#1e293b] lg:text-7xl">
                            {product.name}
                        </h1>

                        <div className="mt-4 flex items-center gap-3">
                            <p className="text-3xl font-semibold text-primary">
                                {product.price}
                            </p>
                            <Badge
                                variant="outline"
                                className="h-auto rounded-none border-[#d9cf98] text-[9px] uppercase tracking-[0.12em] text-[#7c6f2c]"
                            >
                                Limited Edition
                            </Badge>
                        </div>

                        <p className="mt-5 max-w-xl text-lg leading-8 text-[#64748b]">
                            {product.description}
                        </p>

                        <div className="mt-5 space-y-3">
                            <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                    Category
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {productCollections.map((collection) => (
                                        <Badge
                                            key={collection}
                                            variant="outline"
                                            className="h-auto rounded-none border-[#dce4ed] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#334155]"
                                        >
                                            {collection}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                    Sizes
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {productSizes.length > 0 ? (
                                        productSizes.map((size) => (
                                            <Badge
                                                key={size}
                                                variant="outline"
                                                className="h-auto rounded-none border-[#dce4ed] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#334155]"
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
                        </div>

                        <ProductSizeAddToCart
                            productId={product.productId}
                            sizes={productSizes}
                        />

                        <div className="mt-8 space-y-4 border-t border-[#e2e8f0] pt-5 text-[#334155]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                                Specifications
                            </p>
                            <p className="text-lg font-semibold">
                                Material: {product.material}
                            </p>
                            <p className="text-lg font-semibold">
                                Fit: Structured, Architectural Silhouette
                            </p>
                            <p className="text-lg font-semibold">
                                Origin: {product.origin}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-10 lg:py-14 reveal-up">
                <div className="grid gap-10 border-t border-[#e4e7ea] pt-10 lg:grid-cols-[1fr_1fr] lg:items-center">
                    <div>
                        <h2 className="text-5xl font-semibold tracking-tight text-[#1e293b]">
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
                            <div className="border border-[#e2e8f0] p-4">
                                <p className="text-3xl font-semibold text-primary">
                                    14
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                    Days to dye
                                </p>
                            </div>
                            <div className="border border-[#e2e8f0] p-4">
                                <p className="text-3xl font-semibold text-primary">
                                    100%
                                </p>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                                    Organic Indigo
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="image-zoom relative h-96 overflow-hidden rounded-sm bg-[#efefef] lg:h-110">
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
                <h2 className="text-5xl font-semibold text-[#1e293b]">
                    Manufacturing Excellence
                </h2>
                <p className="mx-auto mt-4 max-w-4xl text-lg leading-8 text-[#64748b]">
                    Crafted at our dedicated atelier in Douala, Cameroon. Every
                    garment is ethically sourced and provides sustainable
                    livelihoods for over 40 master artisans.
                </p>

                <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
                    <div className="flex flex-col items-center gap-2">
                        <Sparkle size={24} className="text-[#64748b]" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                            Ethically Sourced
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <GlobeHemisphereWest
                            size={24}
                            className="text-[#64748b]"
                        />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                            Made in Cameroon
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Scales size={24} className="text-[#64748b]" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                            Industrial Precision
                        </p>
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
                            className="hover-lift gap-3 rounded-none bg-transparent p-2 py-2 shadow-none ring-0"
                        >
                            <Link
                                href={`/products/${item.id}`}
                                className="block"
                            >
                                <div className="image-zoom relative h-96 overflow-hidden bg-white">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(min-width: 1024px) 30vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                                <CardContent className="px-0 pb-0 pt-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                        {item.note}
                                    </p>
                                    <h3 className="text-2xl font-semibold text-[#1e293b]">
                                        {item.name}
                                    </h3>
                                    <p className="text-lg font-semibold text-[#334155]">
                                        {item.price}
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
