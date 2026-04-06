"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
    const pathname = usePathname();

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLElement>(
                ".reveal-up:not(.reveal-in)",
            ),
        );

        if (!elements.length) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("reveal-in");
                        observer.unobserve(entry.target);
                    }
                }
            },
            {
                threshold: 0.14,
                rootMargin: "0px 0px -8% 0px",
            },
        );

        for (const element of elements) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [pathname]);

    return null;
}
