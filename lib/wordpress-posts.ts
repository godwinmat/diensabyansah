export type WordPressPost = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    categories: string[];
    date: string;
};

type WpRendered = {
    rendered?: string;
};

type WpEmbeddedMedia = {
    source_url?: string;
};

type WpEmbeddedTerm = {
    name?: string;
    taxonomy?: string;
};

type WpPostRecord = {
    id?: number;
    slug?: string;
    date?: string;
    title?: WpRendered;
    excerpt?: WpRendered;
    content?: WpRendered;
    _embedded?: {
        "wp:featuredmedia"?: WpEmbeddedMedia[];
        "wp:term"?: WpEmbeddedTerm[][];
    };
};

const DEFAULT_BLOG_IMAGE =
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1700&q=80";

function stripHtml(value?: string) {
    return (
        value
            ?.replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim() ?? ""
    );
}

function mapWordPressPost(record: WpPostRecord): WordPressPost {
    const embeddedTerms = record._embedded?.["wp:term"] ?? [];
    const flattenedTerms = embeddedTerms.flat();

    const categories = flattenedTerms
        .filter((term) => term?.taxonomy === "category")
        .map((term) => term?.name?.trim() ?? "")
        .filter(Boolean);

    const featuredImage =
        record._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
        DEFAULT_BLOG_IMAGE;

    const title = stripHtml(record.title?.rendered) || "Untitled Story";
    const excerpt =
        stripHtml(record.excerpt?.rendered) || "Read the full story.";

    return {
        id: Number(record.id ?? 0),
        slug: record.slug?.trim() || String(record.id ?? "story"),
        title,
        excerpt,
        content: record.content?.rendered ?? `<p>${excerpt}</p>`,
        image: featuredImage,
        categories,
        date: record.date ?? "",
    };
}

function getWordPressApiUrl() {
    return process.env.WORDPRESS_API_URL?.replace(/\/$/, "") ?? "";
}

export async function getWordPressPosts(limit = 20, query = "") {
    const apiUrl = getWordPressApiUrl();

    if (!apiUrl) {
        return [];
    }

    const requestUrl = new URL(`${apiUrl}/wp/v2/posts`);
    requestUrl.searchParams.set("_embed", "wp:featuredmedia,wp:term");
    requestUrl.searchParams.set("per_page", String(limit));
    requestUrl.searchParams.set("orderby", "date");
    requestUrl.searchParams.set("order", "desc");

    const searchQuery = query.trim();
    if (searchQuery) {
        requestUrl.searchParams.set("search", searchQuery);
    }

    const response = await fetch(requestUrl, {
        cache: "no-store",
    });

    if (!response.ok) {
        return [];
    }

    const payload = (await response.json().catch(() => [])) as unknown;

    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map((item) => mapWordPressPost(item as WpPostRecord));
}

export async function getWordPressPostBySlug(slug: string) {
    const apiUrl = getWordPressApiUrl();

    if (!apiUrl || !slug) {
        return null;
    }

    const requestUrl = new URL(`${apiUrl}/wp/v2/posts`);
    requestUrl.searchParams.set("_embed", "wp:featuredmedia,wp:term");
    requestUrl.searchParams.set("slug", slug);
    requestUrl.searchParams.set("per_page", "1");

    const response = await fetch(requestUrl, {
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    const payload = (await response.json().catch(() => [])) as unknown;

    if (!Array.isArray(payload) || payload.length === 0) {
        return null;
    }

    return mapWordPressPost(payload[0] as WpPostRecord);
}
