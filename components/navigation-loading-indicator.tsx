"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NON_NAVIGATION_HIDE_MS = 700;
const COMPLETE_HIDE_DELAY_MS = 220;
const MIN_VISIBLE_MS = 260;

export function NavigationLoadingIndicator() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const hideTimeoutRef = useRef<number | null>(null);
    const completeTimeoutRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<number | null>(null);
    const startedAtRef = useRef<number>(0);

    const stopLoading = () => {
        const elapsed = Date.now() - startedAtRef.current;
        const remainingMinVisible = Math.max(MIN_VISIBLE_MS - elapsed, 0);

        setIsLoading(false);

        if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        setProgress(100);

        if (completeTimeoutRef.current) {
            window.clearTimeout(completeTimeoutRef.current);
        }

        completeTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false);
            setProgress(0);
            completeTimeoutRef.current = null;
        }, COMPLETE_HIDE_DELAY_MS + remainingMinVisible);
    };

    const startLoading = (options?: { keepUntilRouteChange?: boolean }) => {
        if (completeTimeoutRef.current) {
            window.clearTimeout(completeTimeoutRef.current);
            completeTimeoutRef.current = null;
        }

        setIsVisible(true);
        setIsLoading(true);
        setProgress((current) => (current > 6 ? current : 8));
        startedAtRef.current = Date.now();

        if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = window.setInterval(() => {
            setProgress((current) => {
                if (current >= 90) {
                    return current;
                }

                const increment = current < 30 ? 12 : current < 60 ? 7 : 3;

                return Math.min(current + increment, 90);
            });
        }, 120);

        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
        }

        if (!options?.keepUntilRouteChange) {
            hideTimeoutRef.current = window.setTimeout(() => {
                stopLoading();
                hideTimeoutRef.current = null;
            }, NON_NAVIGATION_HIDE_MS);
        }
    };

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (event.defaultPrevented) {
                return;
            }

            if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = event.target as HTMLElement | null;

            if (!target) {
                return;
            }

            const clickable = target.closest(
                'a, button, [role="button"], input[type="submit"]',
            ) as HTMLElement | null;

            if (!clickable) {
                return;
            }

            if (
                clickable instanceof HTMLAnchorElement &&
                clickable.target === "_blank"
            ) {
                return;
            }

            if (clickable instanceof HTMLAnchorElement) {
                const href = clickable.getAttribute("href")?.trim() ?? "";

                if (href.startsWith("#") || href.length === 0) {
                    startLoading();
                    return;
                }

                const nextUrl = new URL(href, window.location.href);
                const currentUrl = new URL(window.location.href);
                const isSameOrigin = nextUrl.origin === currentUrl.origin;
                const isSamePage =
                    nextUrl.pathname === currentUrl.pathname &&
                    nextUrl.search === currentUrl.search;

                startLoading({
                    keepUntilRouteChange: isSameOrigin && !isSamePage,
                });
                return;
            }

            if (
                clickable instanceof HTMLButtonElement ||
                clickable instanceof HTMLInputElement
            ) {
                if (clickable.disabled) {
                    return;
                }
            }

            startLoading();
        };

        document.addEventListener("click", handleDocumentClick, true);

        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
        };
    }, []);

    useEffect(() => {
        stopLoading();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current);
            }

            if (completeTimeoutRef.current) {
                window.clearTimeout(completeTimeoutRef.current);
            }

            if (progressIntervalRef.current) {
                window.clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-120 h-1">
            <div
                className={[
                    "h-full bg-linear-to-r from-primary via-[#f4ce59] to-primary shadow-[0_0_12px_rgba(190,150,24,0.65)] transition-[width,opacity] duration-200 ease-out",
                    isVisible ? "opacity-100" : "opacity-0",
                    !isLoading && isVisible ? "duration-300" : "",
                ].join(" ")}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
