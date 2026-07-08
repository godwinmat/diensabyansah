import {
    TestimonialsTable,
    type AdminTestimonial,
} from "@/components/admin/testimonials-table";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

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
                    email: true,
                },
            },
        },
    });

    const serialized: AdminTestimonial[] = testimonials.map((testimonial) => ({
        id: testimonial.id,
        userName: testimonial.user.name,
        userEmail: testimonial.user.email,
        type: testimonial.type,
        text: testimonial.text,
        videoUrl: testimonial.videoUrl,
        createdAt: testimonial.createdAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Testimonies</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review customer-submitted text and video testimonies.
                </p>
            </div>
            <TestimonialsTable initialTestimonials={serialized} />
        </div>
    );
}
