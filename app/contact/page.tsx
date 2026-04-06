import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export default function ContactPage() {
    return (
        <div className="bg-[#f4f4f3]">
            <section className="mx-auto w-full max-w-screen px-3 sm:px-5 pb-8 pt-6 lg:px-10 lg:pb-10 lg:pt-8 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-lg">
                    <Image
                        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80"
                        alt="Modern concierge desk"
                        width={1800}
                        height={540}
                        className="h-64 w-full object-cover sm:h-72 lg:h-84"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#0f2138]/48" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl">
                            Get in Touch
                        </h1>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-screen gap-6 px-3 sm:px-5 pb-12 sm:gap-8 sm:pb-16 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pb-20 reveal-up">
                <form className="glass-panel hover-lift min-w-0 rounded-xl bg-white/70 p-3 pt-4 sm:p-6 md:p-8">
                    <h2 className="text-3xl font-semibold text-[#1e293b] sm:text-4xl md:text-5xl">
                        Inquiry
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#7c8da0] sm:text-base sm:leading-7 md:text-xl md:leading-9">
                        Whether you are a private client seeking a bespoke piece
                        or a global partner, our team is dedicated to providing
                        an unparalleled experience.
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                            First Name
                            <Input
                                defaultValue="Jean"
                                className="mt-2 h-11 w-full border-b border-[#dce4ed] bg-transparent text-base text-[#64748b] outline-none sm:text-lg"
                                type="text"
                            />
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                            Last Name
                            <Input
                                defaultValue="Ansah"
                                className="mt-2 h-11 w-full border-b border-[#dce4ed] bg-transparent text-base text-[#64748b] outline-none sm:text-lg"
                                type="text"
                            />
                        </label>
                    </div>

                    <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Email Address
                        <Input
                            defaultValue="contact@diensa.com"
                            className="mt-2 h-11 w-full border-b border-[#dce4ed] bg-transparent text-base text-[#64748b] outline-none sm:text-lg"
                            type="email"
                        />
                    </label>

                    <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Message
                        <Textarea
                            defaultValue="How can we assist you today?"
                            className="mt-2 min-h-24 w-full border-b border-[#dce4ed] bg-transparent py-2 text-base text-[#64748b] outline-none sm:text-lg"
                        />
                    </label>

                    <Button
                        type="submit"
                        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-sm bg-[#0f1b34] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:mt-10 sm:text-sm"
                    >
                        Send Message ▸
                    </Button>
                </form>

                <div className="min-w-0 space-y-4">
                    <Card className="glass-panel hover-lift gap-0 rounded-lg bg-[#f8fafc]/88 py-0 shadow-none ring-1 ring-[#e2e8f0]">
                        <CardContent className="p-5 sm:p-6 md:p-8">
                            <h3 className="border-l-2 border-primary pl-4 text-3xl font-semibold leading-none text-[#1e293b] sm:text-4xl md:text-5xl">
                                Douala Headquarters
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
                                            Avenue de l&apos;Indépendance,
                                            Bonanjo
                                            <br />
                                            Douala, Littoral Region
                                            <br />
                                            Cameroon
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
                                            Mon -
                                            Fri:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;09:00
                                            AM - 06:00 PM
                                            <br />
                                            Saturday:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:00
                                            AM - 04:00 PM
                                            <br />
                                            Sunday:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By
                                            Appointment Only
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
                                            Concierge: +237 233 44 55 66
                                            <br />
                                            General: hello@diensa-ansah.cm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="hover-lift overflow-hidden rounded-lg w-full">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.982926805878!2d9.704553400000002!3d4.0238909000000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x106112b8beb14df9%3A0xddc83e225dade421!2sAv.%20de%20l&#39;Ind%C3%A9pendance%2C%20Douala%2C%20Cameroon!5e0!3m2!1sen!2sng!4v1774890018125!5m2!1sen!2sng"
                            width="600"
                            height="450"
                            loading="lazy"
                            className="h-72 w-full sm:h-96"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
