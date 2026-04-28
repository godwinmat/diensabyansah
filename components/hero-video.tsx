"use client";

import { useEffect, useRef } from "react";

type HeroVideoProps = {
    playbackRate?: number;
};

export function HeroVideo({ playbackRate = 0.75 }: HeroVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }

        videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    return (
        <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero.jpg"
            preload="metadata"
            aria-label="Diensa hero"
        >
            <source src="/hero.mp4" type="video/mp4" />
        </video>
    );
}
