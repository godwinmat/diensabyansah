import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "diensabyansah.com",
            },
            {
                protocol: "https",
                hostname: "www.diensabyansah.com",
            },
        ],
    },
};

export default nextConfig;
