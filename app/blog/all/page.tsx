import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getWordPressPosts } from "@/lib/wordpress-posts";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type BlogAllPageProps = {
    searchParams?:
        | Promise<{
              q?: string;
          }>
        | {
              q?: string;
          };
};

export default async function BlogAllPage({ searchParams }: BlogAllPageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const query = resolvedSearchParams?.q?.trim() ?? "";
    const posts = await getWordPressPosts(50, query);
    const isSearching = query.length > 0;

    return (
        <div className="bg-[#f4f4f3] min-h-screen">
            <section className="mx-auto w-full max-w-7xl px-5 py-14 lg:px-10 lg:py-16 reveal-up">
                <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Blog
                        </p>
                        <h1 className="mt-2 font-heading text-4xl italic text-[#1e293b] sm:text-5xl">
                            All Stories
                        </h1>
                    </div>

                    <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary no-underline hover:no-underline"
                    >
                        <Link href="/blog">Back to journal</Link>
                    </Button>
                </div>

                <form
                    method="GET"
                    action="/blog/all"
                    className="mt-4 flex max-w-lg items-center gap-2"
                >
                    <Input
                        type="search"
                        name="q"
                        defaultValue={query}
                        placeholder="Search all stories..."
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
                        Showing all recent stories.
                    </p>
                )}

                {posts.length === 0 ? (
                    <div className="mt-10 rounded-xl border border-dashed border-[#dce4ed] bg-white/70 px-6 py-14 text-center text-[#64748b]">
                        <p className="text-lg font-semibold text-[#1e293b]">
                            No stories found.
                        </p>
                        <p className="mt-2 text-sm">
                            Try a different search term.
                        </p>
                    </div>
                ) : (
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
                                    <h2 className="font-heading text-4xl leading-tight text-[#1e293b]">
                                        {post.title}
                                    </h2>
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
                )}
            </section>
        </div>
    );
}
