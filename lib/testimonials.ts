import { prisma } from "@/lib/prisma";
import { TestimonialType } from "@prisma/client";

export type PublicTextTestimonial = {
    id: string;
    quote: string;
    name: string;
    createdAt: string;
};

export type PublicVideoTestimonial = {
    id: string;
    name: string;
    videoUrl: string;
    createdAt: string;
};

export async function getPublicTestimonials() {
    const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            type: true,
            text: true,
            videoUrl: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
    });

    const textTestimonials: PublicTextTestimonial[] = testimonials
        .filter(
            (testimonial) =>
                testimonial.type === TestimonialType.TEXT &&
                typeof testimonial.text === "string" &&
                testimonial.text.trim().length > 0,
        )
        .map((testimonial) => ({
            id: testimonial.id,
            quote: testimonial.text!.trim(),
            name: testimonial.user.name,
            createdAt: testimonial.createdAt.toISOString(),
        }));

    const videoTestimonials: PublicVideoTestimonial[] = testimonials
        .filter(
            (testimonial) =>
                testimonial.type === TestimonialType.VIDEO &&
                typeof testimonial.videoUrl === "string" &&
                testimonial.videoUrl.trim().length > 0,
        )
        .map((testimonial) => ({
            id: testimonial.id,
            name: testimonial.user.name,
            videoUrl: testimonial.videoUrl!.trim(),
            createdAt: testimonial.createdAt.toISOString(),
        }));

    return {
        textTestimonials,
        videoTestimonials,
    };
}
