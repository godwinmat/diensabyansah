import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getWordPressPostBySlug,
    getWordPressPosts,
} from "@/lib/wordpress-posts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
            <section className="mx-auto w-full max-w-7xl px-5 pb-6 pt-4 sm:pb-8 sm:pt-6 lg:px-10 lg:pt-10 reveal-up">
                <div className="image-zoom relative overflow-hidden rounded-2xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]">
                    <div className="relative h-[32svh] min-h-64 sm:h-[38svh] sm:min-h-80 lg:h-[44svh] lg:min-h-90">
                        <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-5 pb-14 sm:pb-16 lg:px-10 lg:pb-24 reveal-up">
                <div className="rounded-2xl border border-[#e2e8f0] bg-white/85 p-6 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
                    <Badge
                        variant="ghost"
                        className="h-auto px-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
                    >
                        {story.categories[0] || "Journal"}
                    </Badge>
                    <h1 className="mt-2 max-w-4xl font-heading text-3xl leading-tight text-[#1e293b] sm:text-4xl md:text-6xl lg:text-7xl">
                        {story.title}
                    </h1>
                    <p className="mt-4 max-w-4xl text-base leading-7 text-[#64748b] sm:mt-5 sm:text-lg sm:leading-8">
                        {story.excerpt}
                    </p>

                    <div
                        className="prose prose-slate mt-8 max-w-4xl text-[#475569] sm:mt-10"
                        dangerouslySetInnerHTML={{ __html: story.content }}
                    />

                    <Button
                        asChild
                        variant="link"
                        className="mt-8 h-auto p-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary no-underline hover:no-underline sm:mt-10 sm:text-sm"
                    >
                        <Link href="/blog">← Back to Journal</Link>
                    </Button>
                </div>
            </section>
        </article>
    );
}
