const brands = [
    {
        name: "Diensa by Ansah",
        logo: true,
    },
    {
        name: "Kibonen NY",
        logo: false,
    },
    {
        name: "Eloli World",
        logo: false,
    },
    {
        name: "Mimie Smith",
        logo: false,
    },
    {
        name: "Saker Couture",
        logo: false,
    },
    {
        name: "Maison Ghys",
        logo: false,
    },
    {
        name: "Margo's Mode",
        logo: false,
    },
    {
        name: "Loza Maleombho",
        logo: false,
    },
    {
        name: "N'G Collection",
        logo: false,
    },
];

const repeatedBrands = [...brands, ...brands];

export function CameroonFashionLogos() {
    return (
        <section className="mx-auto w-full max-w-7xl px-3 py-10 sm:px-5 lg:px-10 lg:py-12 reveal-up">
            <div className="overflow-hidden rounded-2xl border border-[#e6e8eb] bg-linear-to-r from-[#f8f5eb] via-white to-[#f3f4f6] px-4 py-5 sm:px-6 sm:py-6">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a7f87]">
                    Cameroon Fashion Ecosystem
                </p>
                <div className="mt-4 overflow-hidden">
                    <div className="logo-marquee gap-4 sm:gap-6">
                        {repeatedBrands.map((brand, index) => (
                            <div
                                key={`${brand.name}-${index}`}
                                className={
                                    brand.logo
                                        ? "flex items-center gap-2 rounded-full border border-[#d7dbe0] bg-white/95 px-3 py-2.5 text-[#2f3540] shadow-[0_6px_20px_-16px_rgba(15,23,42,0.35)] sm:px-4"
                                        : "rounded-full border border-[#d7dbe0] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#2f3540] sm:px-5 sm:py-2.5"
                                }
                            >
                                {brand.logo ? (
                                    <>
                                        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0f2138] text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:h-9 sm:w-9">
                                            DA
                                        </div>
                                        <div className="leading-tight">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0f2138] sm:text-xs">
                                                Diensa by Ansah
                                            </p>
                                            <p className="text-[9px] uppercase tracking-[0.18em] text-[#7a7f87]">
                                                Official Logo
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    brand.name
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
