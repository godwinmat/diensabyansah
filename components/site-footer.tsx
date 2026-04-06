import { Separator } from "@/components/ui/separator";
import { At, GlobeSimple, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const collections = [
    "Indigo Series",
    "Industrial Line",
    "Heritage Accents",
    "Limited Archives",
];
const company = ["Our Story", "Manufacturing", "Sustainability", "Contact"];
const support = [
    "Shipping & Returns",
    "Size Guide",
    "Privacy Policy",
    "Care Instructions",
];

export function SiteFooter() {
    return (
        <footer className="mt-auto border-t border-border bg-[#f8fafc]/95">
            <div className="mx-auto w-full max-w-screen px-5 py-14 lg:px-10 lg:py-20">
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
                                href="#"
                                aria-label="Website"
                                className="transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
                            >
                                <GlobeSimple size={26} weight="fill" />
                            </Link>
                            <Link
                                href="#"
                                aria-label="Email"
                                className="transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
                            >
                                <At size={26} weight="bold" />
                            </Link>
                            <Link
                                href="#"
                                aria-label="Share"
                                className="transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
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
                    <div className="flex flex-wrap items-center gap-8">
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
    items: string[];
};

function FooterColumn({ title, items }: FooterColumnProps) {
    return (
        <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#0f172a]">
                {title}
            </h3>
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item}>
                        <Link
                            href="#"
                            className="text-lg text-[#64748b] transition-all duration-300 hover:translate-x-1 hover:text-primary"
                        >
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
