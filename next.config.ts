import type { NextConfig } from "next";
type RemotePattern = NonNullable<
    NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

const remotePatterns: RemotePattern[] = [
    {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "diensabyansah.com",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "www.diensabyansah.com",
        pathname: "/**",
    },
    {
        protocol: "https",
        hostname: "zshrmsofoacbindbgvcy.supabase.co",
        pathname: "/storage/v1/object/public/**",
    },
];

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    allowedDevOrigins: ["deep-lynx-free.ngrok-free.app"],
    images: {
        remotePatterns,
    },
};

export default nextConfig;
