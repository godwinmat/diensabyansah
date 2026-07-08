export type Product = {
    id: string;
    name: string;
    price: string;
    image: string;
    note: string;
    description: string;
    origin: string;
    material: string;
};

export const products: Product[] = [
    {
        id: "architectural-adire-blazer",
        name: "Architectural Adire Blazer",
        price: "$450",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
        note: "Structured wool with hand-woven accents",
        description:
            "Heritage meets industrial precision in a structured silhouette designed for modern tailoring.",
        origin: "Made in Cameroon",
        material: "100% Cotton Adire (Hand-dyed)",
    },
    {
        id: "adire-evening-gown",
        name: "Adire Evening Gown",
        price: "$850",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        note: "Authentic hand-dyed Adire silk",
        description:
            "A flowing evening profile grounded in traditional dyeing methods and contemporary construction.",
        origin: "Made in Cameroon",
        material: "Hand-dyed Adire Silk",
    },
    {
        id: "industrial-shift-dress",
        name: "Industrial Shift Dress",
        price: "$320",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
        note: "Minimalist silhouette in industrial cotton",
        description:
            "A clean, architectural form with breathable industrial cotton for everyday luxury.",
        origin: "Made in Cameroon",
        material: "Industrial Cotton",
    },
    {
        id: "modern-heritage-kaftan",
        name: "Modern Heritage Kaftan",
        price: "$510",
        image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        note: "Lightweight linen with tonal embroidery",
        description:
            "A relaxed statement piece that balances tonal embroidery and contemporary movement.",
        origin: "Made in Cameroon",
        material: "Linen Blend",
    },
    {
        id: "sculptural-wrap-top",
        name: "Sculptural Wrap Top",
        price: "$280",
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
        note: "Oversized bows in structured cotton",
        description:
            "A directional wrap top with sculptural lines inspired by modern African forms.",
        origin: "Made in Cameroon",
        material: "Structured Cotton",
    },
    {
        id: "ancestral-silk-scarf",
        name: "Ancestral Silk Scarf",
        price: "$195",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
        note: "Hand-painted silk with gold detailing",
        description:
            "A collectible accent piece with hand-finished motifs and subtle metallic highlights.",
        origin: "Made in Cameroon",
        material: "Hand-painted Silk",
    },
];
