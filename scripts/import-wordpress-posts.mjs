import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const csvPath = path.join(process.cwd(), "wordpress-blog-posts-import.csv");

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"' && inQuotes && next === '"') {
            cell += '"';
            index += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === "," && !inQuotes) {
            row.push(cell);
            cell = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && next === "\n") {
                index += 1;
            }
            row.push(cell);
            if (row.some((value) => value.length > 0)) {
                rows.push(row);
            }
            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function splitTerms(value) {
    return Array.from(
        new Set(
            value
                .split(",")
                .map((term) => term.trim())
                .filter(Boolean),
        ),
    );
}

function parseDate(value) {
    const normalized = value.trim().replace(" ", "T");
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid post_date: ${value}`);
    }

    return date;
}

async function main() {
    const text = fs.readFileSync(csvPath, "utf8");
    const [headers, ...rows] = parseCsv(text);

    if (!headers || rows.length === 0) {
        throw new Error("CSV file has no post rows.");
    }

    const headerIndexes = new Map(
        headers.map((header, index) => [header.trim(), index]),
    );

    const get = (row, key) => row[headerIndexes.get(key)]?.trim() ?? "";
    const latest = await prisma.blogPost.findFirst({
        orderBy: { externalId: "desc" },
        select: { externalId: true },
    });
    let nextExternalId = (latest?.externalId ?? 0) + 1;
    let created = 0;
    let updated = 0;

    for (const row of rows) {
        const slug = get(row, "post_name");
        const existing = await prisma.blogPost.findUnique({
            where: { slug },
            select: { externalId: true },
        });
        const externalId = existing?.externalId ?? nextExternalId++;
        const publishedAt =
            get(row, "post_status") === "publish"
                ? parseDate(get(row, "post_date"))
                : null;
        const categories = [
            ...splitTerms(get(row, "categories")),
            ...splitTerms(get(row, "tags")),
        ];
        const imageUrl = get(row, "featured_image");

        await prisma.blogPost.upsert({
            where: { slug },
            create: {
                externalId,
                slug,
                title: get(row, "post_title"),
                excerpt: get(row, "post_excerpt"),
                content: get(row, "post_content"),
                imageUrl,
                sourceImageUrl: imageUrl,
                categories,
                publishedAt,
            },
            update: {
                title: get(row, "post_title"),
                excerpt: get(row, "post_excerpt"),
                content: get(row, "post_content"),
                imageUrl,
                sourceImageUrl: imageUrl,
                categories,
                publishedAt,
            },
        });

        if (existing) {
            updated += 1;
        } else {
            created += 1;
        }
    }

    console.log(
        `Imported ${rows.length} posts: ${created} created, ${updated} updated.`,
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
