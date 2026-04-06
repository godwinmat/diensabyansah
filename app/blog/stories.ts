export type JournalStory = {
    id: string;
    volume: string;
    title: string;
    excerpt: string;
    image: string;
    content: string[];
};

export const journalStories: JournalStory[] = [
    {
        id: "industrial-symmetry",
        volume: "Volume I · Craft",
        title: "Industrial Symmetry",
        excerpt:
            "Exploring the intersection of brutalist architecture and fluid textile design in our latest seasonal workshop.",
        image: "/journal-1.png",
        content: [
            "At Diensa by Ansah, symmetry is not about rigidity; it is about discipline. Our design teams study industrial geometry and translate those principles into silhouettes that still move with grace.",
            "In this workshop, we paired textured Adire panels with precise paneling systems to create garments that feel architectural but wearable.",
            "The result is a language of form where structure and softness coexist, defining a distinctly modern West African luxury expression.",
        ],
    },
    {
        id: "heritage-reimagined",
        volume: "Volume II · Lineage",
        title: "Heritage Reimagined",
        excerpt:
            "How ancient Kente weaving patterns are being decoded into high-performance structural silhouettes.",
        image: "/journal-2.png",
        content: [
            "Heritage is a source code. In this edition, our team analyzed classic Kente rhythm systems and converted them into modular cutting patterns.",
            "By reinterpreting symbolic pattern logic into contemporary tailoring, we preserve story while expanding function.",
            "This process keeps our lineage alive in every seam, proving that tradition can lead innovation rather than resist it.",
        ],
    },
    {
        id: "manufacturing-modernity",
        volume: "Volume III · Future",
        title: "Manufacturing Modernity",
        excerpt:
            "Inside the new Accra design hub: Where traditional artisans meet robotic precision manufacturing.",
        image: "/journal-3.png",
        content: [
            "Our Accra hub was built around one idea: scale should never erase craft. Automation handles repeatable precision while artisans focus on value-defining details.",
            "From digital pattern calibration to hand-finished trims, each stage is designed to preserve authenticity at industrial capacity.",
            "Manufacturing modernity, for us, means building systems where people and technology elevate each other.",
        ],
    },
];
