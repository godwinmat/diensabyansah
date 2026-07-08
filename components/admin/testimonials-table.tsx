"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export type AdminTestimonial = {
    id: string;
    userName: string;
    userEmail: string;
    type: "TEXT" | "VIDEO";
    text: string | null;
    videoUrl: string | null;
    createdAt: string;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function TestimonialsTable({
    initialTestimonials,
}: {
    initialTestimonials: AdminTestimonial[];
}) {
    const [testimonials, setTestimonials] = useState(initialTestimonials);
    const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            const response = await fetch(
                `/api/admin-panel/testimonials/${deleteTarget.id}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as {
                    message?: string;
                } | null;
                alert(data?.message ?? "Delete failed.");
                return;
            }

            setTestimonials((current) =>
                current.filter((item) => item.id !== deleteTarget.id),
            );
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="overflow-hidden rounded-xl border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/60 hover:bg-muted/60">
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Preview</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testimonials.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No testimonies submitted yet.
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {testimonials.map((testimonial) => (
                            <TableRow key={testimonial.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">
                                            {testimonial.userName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.userEmail}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            testimonial.type === "VIDEO"
                                                ? "outline"
                                                : "secondary"
                                        }
                                    >
                                        {testimonial.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-90 whitespace-normal text-sm text-muted-foreground">
                                    {testimonial.type === "TEXT" ? (
                                        testimonial.text
                                    ) : testimonial.videoUrl ? (
                                        <a
                                            href={testimonial.videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            Open video
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(testimonial.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setDeleteTarget(testimonial)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete testimony?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the selected testimony.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
