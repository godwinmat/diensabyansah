"use client";

import { useMemo, useState } from "react";

type Brand = {
    name: string;
    domain?: string;
    localMark?: boolean;
};

const brands: Brand[] = [
    {
        name: "MaXhosa Africa",
        domain: "maxhosa.africa",
    },
    {
        name: "Rich Mnisi",
        domain: "richmnisi.com",
    },
    {
        name: "Loza Maleombho",
        domain: "lozamaleombho.com",
    },
    {
        name: "Kibonen NY",
        domain: "kibonen.com",
    },
    {
        name: "David Tlale",
        domain: "davidtlale.com",
    },
];

const repeatedBrands = [...brands, ...brands];
const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

export function CameroonFashionLogos() {
    const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

    const repeatedBrandsWithKeys = useMemo(
        () =>
            repeatedBrands.map((brand, index) => ({
                ...brand,
                key: `${brand.name}-${index}`,
            })),
        [],
    );

    return (
        <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-5 lg:px-10 lg:py-12 reveal-up">
            <div className="overflow-hidden rounded-2xl border border-[#e6e8eb] bg-linear-to-r from-[#f8f5eb] via-white to-[#f3f4f6] px-4 py-5 sm:px-6 sm:py-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a7f87]">
                    Cameroon Fashion Ecosystem
                </p>
                <div className="mt-4 overflow-hidden">
                    <div className="logo-marquee gap-4 sm:gap-6">
                        {repeatedBrandsWithKeys.map((brand) => {
                            const logoUrl = brand.domain
                                ? logoDevToken
                                    ? `https://img.logo.dev/${brand.domain}?token=${logoDevToken}&format=webp&retina=true&size=160`
                                    : undefined
                                : undefined;
                            const logoFailed = brand.domain
                                ? failedLogos[brand.domain]
                                : false;

                            return (
                                <div
                                    key={brand.key}
                                    className={
                                        brand.localMark
                                            ? "flex items-center gap-2 rounded-full border border-[#d7dbe0] bg-white/95 px-3 py-2.5 text-[#2f3540] shadow-[0_6px_20px_-16px_rgba(15,23,42,0.35)] sm:px-4"
                                            : "flex items-center justify-center rounded-full border border-[#d7dbe0] bg-white/90 px-4 py-2.5 sm:px-5"
                                    }
                                >
                                    {brand.localMark ? (
                                        <>
                                            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0f2138] text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:h-9 sm:w-9">
                                                DA
                                            </div>
                                            <div className="leading-tight">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0f2138] sm:text-xs">
                                                    Diensa by Ansah
                                                </p>
                                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#7a7f87]">
                                                    Official Logo
                                                </p>
                                            </div>
                                        </>
                                    ) : logoUrl && !logoFailed ? (
                                        <img
                                            src={logoUrl}
                                            alt={`${brand.name} logo`}
                                            className="h-7 w-auto max-w-34 object-contain sm:h-8"
                                            loading="lazy"
                                            decoding="async"
                                            onError={() => {
                                                if (brand.domain) {
                                                    setFailedLogos(
                                                        (current) => ({
                                                            ...current,
                                                            [brand.domain as string]: true,
                                                        }),
                                                    );
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f3540] sm:text-[13px]">
                                            {brand.name}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
