"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    ArrowRight,
    CaretLeft,
    CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const companyImages = [
    { src: "/gallery/958A1777.jpeg", alt: "Gallery image 958A1777" },
    { src: "/gallery/958A1855.jpeg", alt: "Gallery image 958A1855" },
    { src: "/gallery/958A1875.jpeg", alt: "Gallery image 958A1875" },
    { src: "/gallery/958A1891.jpeg", alt: "Gallery image 958A1891" },
    { src: "/gallery/958A1900.jpeg", alt: "Gallery image 958A1900" },
    { src: "/gallery/958A1907.jpeg", alt: "Gallery image 958A1907" },
    { src: "/gallery/958A1953.jpeg", alt: "Gallery image 958A1953" },
    { src: "/gallery/958A1971.jpeg", alt: "Gallery image 958A1971" },
    { src: "/gallery/958A2316.jpeg", alt: "Gallery image 958A2316" },
    { src: "/gallery/958A2416.jpeg", alt: "Gallery image 958A2416" },
    { src: "/gallery/958A2430.jpeg", alt: "Gallery image 958A2430" },
    { src: "/gallery/958A2455.jpeg", alt: "Gallery image 958A2455" },
    { src: "/gallery/958A2492.jpeg", alt: "Gallery image 958A2492" },
    { src: "/gallery/IMG_0612.jpeg", alt: "Gallery image IMG_0612" },
    { src: "/gallery/IMG_0624.jpeg", alt: "Gallery image IMG_0624" },
    { src: "/gallery/IMG_0626.jpeg", alt: "Gallery image IMG_0626" },
    { src: "/gallery/IMG_3561.png", alt: "Gallery image IMG_3561" },
    { src: "/gallery/IMG_7617.jpeg", alt: "Gallery image IMG_7617" },
    { src: "/gallery/IMG_7622.jpeg", alt: "Gallery image IMG_7622" },
    { src: "/gallery/_GPL9759.jpeg", alt: "Gallery image GPL9759" },
];

export default function GalleryPage() {
    const [selectedImage, setSelectedImage] = useState<
        (typeof companyImages)[number] | null
    >(null);

    const selectedImageIndex = useMemo(
        () =>
            selectedImage
                ? companyImages.findIndex(
                      (image) => image.src === selectedImage.src,
                  )
                : -1,
        [selectedImage],
    );

    const showPreviousImage = useCallback(() => {
        if (selectedImageIndex < 0) {
            return;
        }

        const previousIndex =
            (selectedImageIndex - 1 + companyImages.length) %
            companyImages.length;
        setSelectedImage(companyImages[previousIndex]);
    }, [selectedImageIndex]);

    const showNextImage = useCallback(() => {
        if (selectedImageIndex < 0) {
            return;
        }

        const nextIndex = (selectedImageIndex + 1) % companyImages.length;
        setSelectedImage(companyImages[nextIndex]);
    }, [selectedImageIndex]);

    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        const handleArrowNavigation = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousImage();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextImage();
            }
        };

        window.addEventListener("keydown", handleArrowNavigation);

        return () => {
            window.removeEventListener("keydown", handleArrowNavigation);
        };
    }, [selectedImage, showNextImage, showPreviousImage]);

    return (
        <div className="bg-white">
            <section className="mx-auto w-full max-w-7xl px-3 pt-6 sm:px-5 lg:px-10 lg:pt-8 reveal-up">
                <div className="relative overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <div className="relative h-[34svh] min-h-64 sm:h-[44svh]">
                        <Image
                            src="/gallery/958A1777.jpeg"
                            alt="Diensa visual archive"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-[50%_30%]"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#0f2138]/55" />
                    <div className="absolute inset-x-4 bottom-6 text-white sm:inset-x-6 lg:inset-x-10 lg:bottom-10">
                        <Badge className="h-auto bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#1f2937]">
                            Gallery
                        </Badge>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Diensa Image Archive
                        </h1>
                        <p className="my-3 max-w-3xl text-sm text-white/85 sm:text-base">
                            A visual collection of our production culture,
                            craftsmanship standards, and editorial identity.
                        </p>

                        <Button
                            asChild
                            className="h-11 w-full rounded-sm bg-primary px-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f2937] hover:opacity-90 sm:w-auto"
                        >
                            <Link href="/contact">
                                Partner With Diensa
                                <ArrowRight size={14} weight="bold" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-5 lg:px-10 lg:pb-20 lg:pt-10 reveal-up">
                <div className="grid auto-rows-[180px] gap-3 sm:auto-rows-[220px] sm:grid-cols-2 lg:grid-cols-4">
                    {companyImages.map((image, index) => {
                        const spanClass =
                            index % 7 === 0
                                ? "sm:col-span-2"
                                : index % 5 === 0
                                  ? "sm:row-span-2"
                                  : "";

                        return (
                            <button
                                key={image.src}
                                type="button"
                                onClick={() => setSelectedImage(image)}
                                className={`image-zoom relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)] ${spanClass}`}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                                    className="object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                                />
                            </button>
                        );
                    })}
                </div>
            </section>

            <Dialog
                open={Boolean(selectedImage)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedImage(null);
                    }
                }}
            >
                <DialogContent
                    className="w-[calc(100vw-1rem)] max-w-none border-0 bg-transparent p-0 text-white shadow-none sm:w-[min(95vw,1200px)]"
                    showCloseButton
                    overlayClassName="bg-black/90"
                >
                    <DialogTitle className="sr-only">
                        {selectedImage?.alt ?? "Gallery image preview"}
                    </DialogTitle>
                    {selectedImage ? (
                        <div className="relative h-[72svh] w-full overflow-hidden rounded-xl sm:h-[82svh]">
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                fill
                                sizes="100vw"
                                className="object-contain"
                                priority
                            />

                            <button
                                type="button"
                                onClick={showPreviousImage}
                                className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-black/35 text-white transition hover:bg-black/55 sm:left-3 sm:h-10 sm:w-10"
                                aria-label="Previous image"
                            >
                                <CaretLeft size={20} weight="bold" />
                            </button>

                            <button
                                type="button"
                                onClick={showNextImage}
                                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-black/35 text-white transition hover:bg-black/55 sm:right-3 sm:h-10 sm:w-10"
                                aria-label="Next image"
                            >
                                <CaretRight size={20} weight="bold" />
                            </button>

                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-5 text-center sm:p-6">
                                <p className="mt-1 text-xs text-white/75">
                                    Use left and right arrow keys to navigate
                                </p>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
