import { Separator } from "@/components/ui/separator";
import { getWooCommerceCollections } from "@/lib/woocommerce";
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
    const collections = (await getWooCommerceCollections())
        .filter((collection) => collection.productCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 4)
        .map((collection) => ({
            label: collection.name,
            href: `/products?collection=${encodeURIComponent(collection.name)}`,
        }));

    return (
        <footer className="mt-auto border-t border-border bg-[#f8fafc]/95">
            <div className="mx-auto w-full max-w-7xl px-5 py-14 lg:px-10 lg:py-20">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="grid h-5 w-5 place-items-center rounded-xs bg-[#0f766e] text-[10px] font-semibold text-white">
                                D
                            </div>
                            <p className="text-xl font-bold uppercase tracking-tight text-[#0f172a]">
                                Diensa
                            </p>
                        </div>
                        <p className="max-w-64 text-lg leading-8 text-[#64748b]">
                            Bridging the gap between traditional African
                            artistry and contemporary industrial luxury fashion.
                        </p>
                        <div className="flex items-center gap-5 text-[#0f172a]">
                            <Link
                                href="/"
                                aria-label="Homepage"
                                className="grid h-10 w-10 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                            >
                                <GlobeSimple size={26} weight="fill" />
                            </Link>
                            <Link
                                href="mailto:info@diensabyansah.cm"
                                aria-label="Email"
                                className="grid h-10 w-10 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                            >
                                <At size={26} weight="bold" />
                            </Link>
                            <Link
                                href="/contact"
                                aria-label="Contact"
                                className="grid h-10 w-10 place-items-center rounded-full border border-[#dbe2ea] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                            >
                                <ShareNetwork size={26} weight="fill" />
                            </Link>
                        </div>
                    </div>

                    <FooterColumn title="Collections" items={collections} />
                    <FooterColumn title="Company" items={company} />
                    <FooterColumn title="Support" items={support} />
                </div>

                <Separator className="mt-16 bg-[#dbe2ea]" />
                <div className="pt-7 text-xs font-medium uppercase tracking-[0.2em] text-[#334155] md:flex md:items-center md:justify-between">
                    <p>© 2026 Diensa by Ansah. All rights reserved.</p>
                    <div className="mt-4 flex flex-wrap items-center gap-8 md:mt-0">
                        <p>Designed for excellence</p>
                        <p>Crafted in Cameroon</p>
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
        <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#0f172a]">
                {title}
            </h3>
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={typeof item === "string" ? item : item.label}>
                        <Link
                            href={typeof item === "string" ? "#" : item.href}
                            className="text-lg text-[#64748b] transition-all duration-300 hover:translate-x-1 hover:text-primary"
                        >
                            {typeof item === "string" ? item : item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
