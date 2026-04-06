import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getWordPressPostBySlug,
    getWordPressPosts,
} from "@/lib/wordpress-posts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

type BlogDetailPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
    const posts = await getWordPressPosts(20);

    return posts.map((post) => ({ id: post.slug }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
    const { id } = await params;
    const story = await getWordPressPostBySlug(id);

    if (!story) {
        notFound();
    }

    return (
        <article className="bg-[#f4f4f3]">
            <section className="mx-auto w-full max-w-7xl px-5 pb-8 pt-6 lg:px-10 lg:pt-10 reveal-up">
                <div className="image-zoom relative h-[44svh] min-h-90 overflow-hidden rounded-xl">
                    <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover"
                    />
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 pb-20 lg:px-10 lg:pb-24 reveal-up">
                <Badge
                    variant="ghost"
                    className="h-auto px-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
                >
                    {story.categories[0] || "Journal"}
                </Badge>
                <h1 className="mt-2 max-w-4xl font-heading text-5xl leading-tight text-[#1e293b] md:text-7xl">
                    {story.title}
                </h1>
                <p className="mt-5 max-w-4xl text-lg leading-8 text-[#64748b]">
                    {story.excerpt}
                </p>

                <div
                    className="mt-10 max-w-4xl space-y-6 text-lg leading-9 text-[#475569]"
                    dangerouslySetInnerHTML={{ __html: story.content }}
                />

                <Button
                    asChild
                    variant="link"
                    className="mt-10 h-auto p-0 text-sm font-semibold uppercase tracking-[0.16em] text-primary no-underline hover:no-underline"
                >
                    <Link href="/blog">← Back to Journal</Link>
                </Button>
            </section>
        </article>
    );
}
