import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getWordPressPosts } from "@/lib/wordpress-posts";
import Image from "next/image";
import Link from "next/link";

export const runtime = "nodejs";

const events = [
    {
        day: "12",
        month: "Oct",
        title: "Paris Fashion Week: Mainstage",
        location: "Paris, France",
        cta: "RSVP",
        emphasis: "outline",
    },
    {
        day: "04",
        month: "Nov",
        title: "The Industrial Textile Summit",
        location: "Accra, Ghana",
        cta: "Register",
        emphasis: "filled",
    },
    {
        day: "21",
        month: "Dec",
        title: "Modernity in Motion Exhibit",
        location: "Tokyo, Japan",
        cta: "RSVP",
        emphasis: "outline",
    },
];

type BlogPageProps = {
    searchParams?:
        | Promise<{
              q?: string;
          }>
        | {
              q?: string;
          };
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const query = resolvedSearchParams?.q?.trim() ?? "";
    const isSearching = query.length > 0;
    const posts = await getWordPressPosts(isSearching ? 20 : 4, query);

    return (
        <div className="bg-[#f4f4f3]">
            <section className="relative overflow-hidden reveal-up">
                <div className="image-zoom relative h-[56svh] min-h-120">
                    <Image
                        src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1700&q=80"
                        alt="Fashion editorial model"
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-[#243447]/52" />

                <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-16 text-center lg:pb-20">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-primary">
                        Established in Accra
                    </p>
                    <h1 className="mt-2 font-heading text-5xl font-medium leading-[1.04] text-[#0f172a] md:text-7xl">
                        The Journal &amp; Collective
                    </h1>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 py-16 lg:px-10 lg:py-20 reveal-up">
                <div className="flex items-end justify-between gap-3 pb-3">
                    <h2 className="font-heading text-5xl italic text-[#1e293b]">
                        The Journal
                    </h2>
                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:no-underline"
                    >
                        <Link href="/blog/all">View all stories</Link>
                    </Button>
                </div>
                <Separator className="bg-[#e7eaee]" />

                <form
                    method="GET"
                    action="/blog"
                    className="mt-5 flex max-w-lg items-center gap-2"
                >
                    <Input
                        type="search"
                        name="q"
                        defaultValue={query}
                        placeholder="Search stories..."
                        className="h-10 rounded-none border-[#dbe1e7] bg-white text-sm text-[#334155]"
                    />
                    <Button
                        type="submit"
                        className="h-10 rounded-none px-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    >
                        Search
                    </Button>
                </form>

                {isSearching ? (
                    <p className="mt-3 text-sm text-[#64748b]">
                        {posts.length} result{posts.length === 1 ? "" : "s"} for
                        “{query}”
                    </p>
                ) : (
                    <p className="mt-3 text-sm text-[#64748b]">
                        Showing the 4 most recent stories.
                    </p>
                )}

                <div className="mt-8 grid gap-7 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Card
                            key={post.slug}
                            className="hover-lift gap-5 rounded-none bg-transparent p-2 py-2 shadow-none ring-0"
                        >
                            <div className="image-zoom relative h-100 overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    sizes="(min-width: 1024px) 31vw, 100vw"
                                    className="object-cover"
                                />
                            </div>
                            <CardContent className="space-y-3 px-2 pb-2">
                                <Badge
                                    variant="ghost"
                                    className="h-auto px-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
                                >
                                    {post.categories[0] || "Journal"}
                                </Badge>
                                <h3 className="font-heading text-4xl leading-tight text-[#1e293b]">
                                    {post.title}
                                </h3>
                                <p className="text-base leading-7 text-[#6b7280]">
                                    {post.excerpt}
                                </p>
                                <Button
                                    asChild
                                    variant="link"
                                    className="h-auto p-0 text-sm font-semibold text-[#111827] no-underline hover:no-underline"
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        Read Story
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="border-y border-[#eceff3] bg-[#f7f7f6] py-20 reveal-up">
                <div className="mx-auto w-full max-w-screen px-5 lg:px-10">
                    <h2 className="font-heading text-5xl italic text-[#1e293b]">
                        Global Events &amp; Exhibitions
                    </h2>
                    <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#9ca3af]">
                        The 2024 world tour calendar
                    </p>

                    <div className="mt-10 border-y border-[#e0e5ea]">
                        {events.map((event) => (
                            <article
                                key={event.title}
                                className="hover-lift grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-[#e0e5ea] py-7 last:border-b-0"
                            >
                                <div className="min-w-12 text-center">
                                    <p className="text-4xl font-semibold leading-none text-primary">
                                        {event.day}
                                    </p>
                                    <Badge
                                        variant="ghost"
                                        className="mt-1 h-auto px-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]"
                                    >
                                        {event.month}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-3xl font-medium text-[#1e293b]">
                                        {event.title}
                                    </h3>
                                    <p className="mt-1 text-sm font-medium uppercase tracking-[0.08em] text-[#94a3b8]">
                                        ⊙ {event.location}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        event.emphasis === "filled"
                                            ? "default"
                                            : "outline"
                                    }
                                    className={
                                        event.emphasis === "filled"
                                            ? "h-10 min-w-30 rounded-none bg-primary px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
                                            : "h-10 min-w-30 rounded-none border-primary px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
                                    }
                                >
                                    {event.cta}
                                </Button>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-screen px-5 py-24 text-center lg:px-10 lg:py-28 reveal-up">
                <h2 className="font-heading text-6xl italic leading-tight text-[#1e293b] md:text-7xl">
                    Join the Inner Collective
                </h2>
                <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-[#7c8da0]">
                    Gain access to limited edition archival drops, private
                    showroom events, and deep dives into the manufacturing of
                    our luxury collections.
                </p>

                <form className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                    <Input
                        type="email"
                        placeholder="Your email address"
                        className="h-11 flex-1 rounded-none border-[#dbe1e7] bg-transparent text-sm text-[#334155]"
                    />
                    <Button
                        type="submit"
                        className="h-11 rounded-none bg-primary px-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
                    >
                        Subscribe
                    </Button>
                </form>
            </section>

            <section className="h-16" />
        </div>
    );
}
