import { NavigationLoadingIndicator } from "@/components/navigation-loading-indicator";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const playfairDisplayHeading = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Diensa by Ansah",
    description: "Industrial luxury fashion storefront",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                "font-sans",
                inter.variable,
                playfairDisplayHeading.variable,
            )}
        >
            <body className="min-h-full flex flex-col">
                <Suspense fallback={null}>
                    <NavigationLoadingIndicator />
                </Suspense>
                <ScrollReveal />
                <Suspense fallback={null}>
                    <SiteHeader />
                </Suspense>
                <main className="relative flex-1 overflow-x-clip pt-16 lg:pt-20">
                    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-linear-to-b from-primary/8 to-transparent" />
                    {children}
                </main>
                <SiteFooter />
            </body>
        </html>
    );
}
