import { Separator } from "@/components/ui/separator";
import { getCatalogCollections } from "@/lib/catalog";
import { getCompanyProfile } from "@/lib/company-profile";
import { At, GlobeSimple, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const company = [
    { label: "Our Story", href: "/about" },
    { label: "Manufacturing", href: "/about" },
    { label: "Sustainability", href: "/about" },
    { label: "Contact", href: "/contact" },
];
const support = [
    "Shipping & Returns",
    "Size Guide",
    "Privacy Policy",
    "Care Instructions",
];

export async function SiteFooter() {
    const [collections, profile] = await Promise.all([
        getCatalogCollections(),
        getCompanyProfile(),
    ]);

    const visibleCollections = collections
        .filter((collection) => collection.productCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 4)
        .map((collection) => ({
            label: collection.name,
            href: `/products?collection=${encodeURIComponent(collection.name)}`,
        }));

    const displayName = profile.companyName;
    const displayWordmark = displayName.split(" by ")[0]?.trim() || displayName;
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-border bg-[#f8fafc]/95">
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 sm:py-12 lg:px-10 lg:py-20">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-5 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="grid h-5 w-5 place-items-center rounded-xs bg-[#0f766e] text-[10px] font-semibold text-white">
                                D
                            </div>
                            <p className="text-lg font-bold uppercase tracking-tight text-[#0f172a] sm:text-xl">
                                {displayWordmark}
                            </p>
                        </div>
                        <p className="max-w-xs text-sm leading-6 text-[#64748b] sm:max-w-64 sm:text-base sm:leading-7">
                            Bridging the gap between traditional African
                            artistry and contemporary industrial luxury fashion.
                        </p>
                        <div className="flex items-center gap-3 text-[#0f172a] sm:gap-4">
                            <Link
                                href="/"
                                aria-label="Homepage"
                                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary sm:h-10 sm:w-10"
                            >
                                <GlobeSimple size={20} weight="fill" />
                            </Link>
                            <Link
                                href={`mailto:${profile.contactEmail}`}
                                aria-label="Email"
                                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary sm:h-10 sm:w-10"
                            >
                                <At size={20} weight="bold" />
                            </Link>
                            <Link
                                href="/contact"
                                aria-label="Contact"
                                className="grid h-9 w-9 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary sm:h-10 sm:w-10"
                            >
                                <ShareNetwork size={20} weight="fill" />
                            </Link>
                        </div>
                    </div>

                    <FooterColumn
                        title="Collections"
                        items={visibleCollections}
                    />
                    <FooterColumn title="Company" items={company} />
                    <FooterColumn title="Support" items={support} />
                </div>

                <Separator className="mt-10 bg-[#dbe2ea] sm:mt-12 lg:mt-16" />
                <div className="pt-6 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-[#334155] sm:text-xs sm:tracking-[0.2em] md:flex md:items-center md:justify-between md:text-left">
                    <p className="leading-5">
                        © {currentYear} {displayName}. All rights reserved.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:mt-4 sm:gap-6 md:mt-0 md:justify-start md:gap-8">
                        <p>Designed for excellence</p>
                        <p>{profile.craftedInLabel}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

type FooterColumnProps = {
    title: string;
    items: Array<string | { label: string; href: string }>;
};

function FooterColumn({ title, items }: FooterColumnProps) {
    return (
        <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0f172a] sm:text-sm">
                {title}
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
                {items.map((item) => (
                    <li key={typeof item === "string" ? item : item.label}>
                        <Link
                            href={typeof item === "string" ? "#" : item.href}
                            className="text-sm text-[#64748b] transition-all duration-300 hover:translate-x-1 hover:text-primary sm:text-base"
                        >
                            {typeof item === "string" ? item : item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
