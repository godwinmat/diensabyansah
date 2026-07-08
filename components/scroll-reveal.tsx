"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
    const pathname = usePathname();

    useEffect(() => {
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

        const observePending = () => {
            const elements = Array.from(
                document.querySelectorAll<HTMLElement>(
                    ".reveal-up:not(.reveal-in):not([data-reveal-observed='true'])",
                ),
            );

            for (const element of elements) {
                element.dataset.revealObserved = "true";
                observer.observe(element);
            }
        };

        observePending();

        const mutationObserver = new MutationObserver(() => {
            observePending();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            mutationObserver.disconnect();
            observer.disconnect();
        };
    }, [pathname]);

    return null;
}
