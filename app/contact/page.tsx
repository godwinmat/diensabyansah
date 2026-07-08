import { ContactForm } from "@/components/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    getCompanyMapEmbedUrl,
    getCompanyProfile,
} from "@/lib/company-profile";
import { Clock, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export const dynamic = "force-dynamic";

function renderBusinessHours(hours: string) {
    return hours
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line, index) => (
            <span key={`${line}-${index}`}>
                {line}
                <br />
            </span>
        ));
}

export default async function ContactPage() {
    const profile = await getCompanyProfile();
    const mapEmbedUrl = getCompanyMapEmbedUrl(profile);

    return (
        <div className="bg-[#f4f4f3]">
            <section className="mx-auto w-full max-w-7xl px-3 pb-8 pt-6 sm:px-5 lg:px-10 lg:pb-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <Image
                        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
                        alt="Modern concierge desk"
                        width={1800}
                        height={540}
                        className="h-64 w-full object-cover sm:h-72 lg:h-84"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#0f2138]/52" />
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                                Concierge
                            </p>
                            <h1 className="mt-4 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">
                                Get in Touch
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/78 sm:text-base">
                                Private client appointments, partnership
                                inquiries, and bespoke requests handled with
                                care.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-5 px-3 reveal-up sm:px-5 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:px-10 lg:pb-20">
                <ContactForm />

                <div className="min-w-0 space-y-4">
                    <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/85 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)]">
                        <CardContent className="p-5 sm:p-6 md:p-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                                Visit Us
                            </p>
                            <h3 className="mt-4 border-l-2 border-primary pl-4 text-3xl font-semibold leading-none text-[#1e293b] sm:text-4xl md:text-5xl">
                                {profile.city} Headquarters
                            </h3>

                            <div className="mt-6 space-y-6 sm:mt-7 sm:space-y-7">
                                <div className="flex items-start gap-3">
                                    <MapPin
                                        size={18}
                                        className="mt-1 text-primary"
                                    />
                                    <div>
                                        <Badge
                                            variant="ghost"
                                            className="h-auto px-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]"
                                        >
                                            Location
                                        </Badge>
                                        <p className="mt-2 text-base leading-7 text-[#64748b] sm:text-lg sm:leading-8">
                                            {profile.addressLine1}
                                            <br />
                                            {profile.addressLine2
                                                ? `${profile.addressLine2}`
                                                : `${profile.city}, ${profile.stateRegion}`}
                                            <br />
                                            {profile.country}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock
                                        size={18}
                                        className="mt-1 text-primary"
                                    />
                                    <div>
                                        <Badge
                                            variant="ghost"
                                            className="h-auto px-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]"
                                        >
                                            Business Hours
                                        </Badge>
                                        <p className="mt-2 text-base leading-7 text-[#64748b] sm:text-lg sm:leading-8">
                                            {renderBusinessHours(
                                                profile.businessHours,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone
                                        size={18}
                                        className="mt-1 text-primary"
                                    />
                                    <div>
                                        <Badge
                                            variant="ghost"
                                            className="h-auto px-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]"
                                        >
                                            Contact Details
                                        </Badge>
                                        <p className="mt-2 text-base leading-7 text-[#64748b] sm:text-lg sm:leading-8">
                                            Concierge: {profile.phonePrimary}
                                            <br />
                                            General: {profile.supportEmail}
                                            {profile.phoneSecondary ? (
                                                <>
                                                    <br />
                                                    Alternate:{" "}
                                                    {profile.phoneSecondary}
                                                </>
                                            ) : null}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {mapEmbedUrl.length ? (
                        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)]">
                            <iframe
                                src={mapEmbedUrl}
                                width="600"
                                height="450"
                                loading="lazy"
                                className="h-72 w-full sm:h-96"
                                title="Company location map"
                            />
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
