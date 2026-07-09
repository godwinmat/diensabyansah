"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollReveal() {
    const pathname = usePathname();

    useEffect(() => {
        let hasStarted = false;
        let onLoadHandler: (() => void) | null = null;
        const observed = new WeakSet<Element>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("reveal-in");
                        observer.unobserve(entry.target);
                        observed.delete(entry.target);
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
                    ".reveal-up:not(.reveal-in)",
                ),
            );

            for (const element of elements) {
                if (observed.has(element)) {
                    continue;
                }

                observed.add(element);
                observer.observe(element);
            }
        };

        const resetAndObserve = () => {
            const elements = Array.from(
                document.querySelectorAll<HTMLElement>(".reveal-up"),
            );

            for (const element of elements) {
                element.classList.remove("reveal-in");
            }

            observePending();
        };

        resetAndObserve();

        const rafId = requestAnimationFrame(() => {
            observePending();
        });

        const timeoutId = window.setTimeout(() => {
            observePending();
        }, 120);

        const mutationObserver = new MutationObserver(() => {
            if (hasStarted) {
                observePending();
            }
        });

        const startRevealObservers = () => {
            if (hasStarted) {
                return;
            }

            hasStarted = true;
            resetAndObserve();

            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
        };

        // Delay reveal class mutations until the page has fully loaded so
        // streamed SSR content can hydrate without DOM/class interference.
        const startDelayId = window.setTimeout(() => {
            if (document.readyState === "complete") {
                startRevealObservers();
            } else {
                onLoadHandler = () => {
                    startRevealObservers();
                    if (onLoadHandler) {
                        window.removeEventListener("load", onLoadHandler);
                        onLoadHandler = null;
                    }
                };

                window.addEventListener("load", onLoadHandler);
            }
        }, 180);

        return () => {
            hasStarted = false;
            window.clearTimeout(startDelayId);
            if (onLoadHandler) {
                window.removeEventListener("load", onLoadHandler);
            }
            window.clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            mutationObserver.disconnect();
            observer.disconnect();
        };
    }, [pathname]);

    return null;
}
