"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stat = {
    value: string;
    label: string;
};

type ParsedStat = {
    label: string;
    target: number;
    prefix: string;
    suffix: string;
    decimals: number;
    useGrouping: boolean;
};

function parseStatValue(stat: Stat): ParsedStat {
    const match = stat.value.match(/^(\D*?)([\d,.]+)(\D*)$/);

    if (!match) {
        return {
            label: stat.label,
            target: 0,
            prefix: "",
            suffix: stat.value,
            decimals: 0,
            useGrouping: false,
        };
    }

    const [, prefix, numericText, suffix] = match;
    const decimals = numericText.includes(".")
        ? (numericText.split(".")[1]?.length ?? 0)
        : 0;
    const target = Number(numericText.replace(/,/g, ""));

    return {
        label: stat.label,
        target: Number.isFinite(target) ? target : 0,
        prefix,
        suffix,
        decimals,
        useGrouping: numericText.includes(","),
    };
}

function easeOutCubic(t: number) {
    return 1 - (1 - t) ** 3;
}

function formatAnimatedValue(value: number, stat: ParsedStat) {
    const animatedValue =
        stat.decimals > 0 ? value : Math.round(Math.max(value, 0));

    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: stat.decimals,
        maximumFractionDigits: stat.decimals,
        useGrouping: stat.useGrouping,
    }).format(animatedValue);

    return `${stat.prefix}${formatted}${stat.suffix}`;
}

export function AnimatedStats({ stats }: { stats: Stat[] }) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [progress, setProgress] = useState(0);

    const parsedStats = useMemo(() => stats.map(parseStatValue), [stats]);

    useEffect(() => {
        const element = rootRef.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.3,
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isInView) {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setProgress(1);
            return;
        }

        const duration = 1400;
        const start = performance.now();
        let frame = 0;

        const animate = (now: number) => {
            const elapsed = now - start;
            const normalized = Math.min(elapsed / duration, 1);
            setProgress(easeOutCubic(normalized));

            if (normalized < 1) {
                frame = requestAnimationFrame(animate);
            }
        };

        frame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [isInView]);

    return (
        <div
            ref={rootRef}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:mt-14 sm:gap-12 md:gap-16"
        >
            {parsedStats.map((stat) => (
                <div
                    key={stat.label}
                    className="hover-lift rounded-xl px-5 py-4"
                >
                    <p className="text-4xl font-semibold text-[#0f172a] sm:text-5xl">
                        {formatAnimatedValue(stat.target * progress, stat)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
    );
}
