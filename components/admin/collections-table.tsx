"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export type AdminCollection = {
    id: string;
    externalId: number | null;
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    productCount: number;
    featured: boolean;
    createdAt: string;
};

type FormState = {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    externalId: string;
    featured: boolean;
};

const empty: FormState = {
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    externalId: "",
    featured: false,
};

function toSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function CollectionsTable({
    initialCollections,
}: {
    initialCollections: AdminCollection[];
}) {
    const router = useRouter();
    const [collections, setCollections] = useState(initialCollections);
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(empty);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [pendingUploadedImagePath, setPendingUploadedImagePath] = useState<
        string | null
    >(null);
    const [feedback, setFeedback] = useState<{
        ok: boolean;
        msg: string;
    } | null>(null);

    const openCreate = () => {
        setForm(empty);
        setPendingUploadedImagePath(null);
        setMode("create");
        setEditId(null);
        setFeedback(null);
        setModalOpen(true);
    };

    const openEdit = (col: AdminCollection) => {
        setForm({
            name: col.name,
            slug: col.slug,
            description: col.description,
            imageUrl: col.imageUrl,
            externalId: col.externalId != null ? String(col.externalId) : "",
            featured: col.featured,
        });
        setPendingUploadedImagePath(null);
        setMode("edit");
        setEditId(col.id);
        setFeedback(null);
        setModalOpen(true);
    };

    const deleteUploadedImageByPath = async (path: string) => {
        await fetch("/api/admin-panel/uploads", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path }),
        }).catch(() => null);
    };

    const closeModal = async (cleanupPendingUpload = true) => {
        if (cleanupPendingUpload && pendingUploadedImagePath) {
            await deleteUploadedImageByPath(pendingUploadedImagePath);
        }

        setModalOpen(false);
        setPendingUploadedImagePath(null);
        setFeedback(null);
    };

    const handleNameChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            name: value,
            slug:
                prev.slug === "" || prev.slug === toSlug(prev.name)
                    ? toSlug(value)
                    : prev.slug,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        if (!form.imageUrl.trim()) {
            setFeedback({
                ok: false,
                msg: "Please upload a collection image before saving.",
            });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            name: form.name,
            slug: form.slug,
            description: form.description,
            imageUrl: form.imageUrl,
            externalId: form.externalId || undefined,
            featured: form.featured,
        };

        try {
            const url =
                mode === "create"
                    ? "/api/admin-panel/collections"
                    : `/api/admin-panel/collections/${editId}`;
            const method = mode === "create" ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = (await res.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!res.ok) {
                setFeedback({
                    ok: false,
                    msg: data?.message ?? "Request failed.",
                });
                return;
            }

            setFeedback({
                ok: true,
                msg:
                    mode === "create"
                        ? "Collection created."
                        : "Collection updated.",
            });
            setPendingUploadedImagePath(null);
            router.refresh();
            setTimeout(() => {
                void closeModal(false);
                window.location.reload();
            }, 600);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsUploadingImage(true);
        setFeedback(null);

        try {
            const formData = new FormData();
            formData.append("entity", "collections");
            formData.append("file", file);

            const res = await fetch("/api/admin-panel/uploads", {
                method: "POST",
                body: formData,
            });

            const data = (await res.json().catch(() => null)) as {
                message?: string;
                url?: string;
                path?: string;
            } | null;

            if (!res.ok || !data?.url) {
                setFeedback({
                    ok: false,
                    msg: data?.message ?? "Image upload failed.",
                });
                return;
            }

            if (pendingUploadedImagePath) {
                await deleteUploadedImageByPath(pendingUploadedImagePath);
            }

            setForm((prev) => ({ ...prev, imageUrl: data.url! }));
            setPendingUploadedImagePath(data.path ?? null);
            setFeedback({ ok: true, msg: "Image uploaded." });
        } finally {
            setIsUploadingImage(false);
            event.target.value = "";
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/admin-panel/collections/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setCollections((prev) => prev.filter((c) => c.id !== id));
            setDeleteTarget(null);
        } else {
            const data = (await res.json().catch(() => null)) as {
                message?: string;
            } | null;
            alert(data?.message ?? "Delete failed.");
            setDeleteTarget(null);
        }
    };

    return (
        <>
            <Card className="gap-0 py-0 hover:translate-y-0">
                <CardHeader className="flex-row items-center justify-between border-b py-4">
                    <CardTitle className="text-sm text-muted-foreground">
                        {collections.length} collection
                        {collections.length !== 1 ? "s" : ""}
                    </CardTitle>
                    <Button type="button" onClick={openCreate}>
                        New Collection
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/60 hover:bg-muted/60">
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collections.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No collections yet. Create your first
                                        one.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {collections.map((col) => (
                                <TableRow key={col.id}>
                                    <TableCell className="font-medium">
                                        {col.name}
                                    </TableCell>
                                    <TableCell className="max-w-[180px] truncate font-mono text-xs text-muted-foreground">
                                        {col.slug}
                                    </TableCell>
                                    <TableCell>{col.productCount}</TableCell>
                                    <TableCell>
                                        {col.featured ? (
                                            <Badge variant="secondary">
                                                Featured
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(col.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="secondary"
                                                onClick={() => openEdit(col)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        id: col.id,
                                                        name: col.name,
                                                    })
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog
                open={modalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        void closeModal();
                    } else {
                        setModalOpen(true);
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create"
                                ? "New Collection"
                                : "Edit Collection"}
                        </DialogTitle>
                        <DialogDescription>
                            Manage product category details and featured status.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="collection-name">Name</Label>
                                <Input
                                    id="collection-name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    placeholder="Collection name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="collection-slug">Slug</Label>
                                <Input
                                    id="collection-slug"
                                    required
                                    value={form.slug}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            slug: e.target.value,
                                        }))
                                    }
                                    className="font-mono"
                                    placeholder="collection-slug"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="collection-image">
                                Collection Image
                            </Label>
                            <Input
                                id="collection-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploadingImage}
                            />
                            <p className="text-xs text-muted-foreground">
                                {isUploadingImage
                                    ? "Uploading image..."
                                    : form.imageUrl
                                      ? "Image uploaded successfully."
                                      : "Upload an image to continue."}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="collection-external-id">
                                    External ID
                                </Label>
                                <Input
                                    id="collection-external-id"
                                    type="number"
                                    value={form.externalId}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            externalId: e.target.value,
                                        }))
                                    }
                                    placeholder="Optional"
                                />
                            </div>
                            <Label className="mt-7 flex items-center gap-2 rounded-md border p-3">
                                <Checkbox
                                    checked={form.featured}
                                    onCheckedChange={(checked) =>
                                        setForm((p) => ({
                                            ...p,
                                            featured: checked === true,
                                        }))
                                    }
                                />
                                Featured collection
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="collection-description">
                                Description
                            </Label>
                            <Textarea
                                id="collection-description"
                                required
                                rows={5}
                                value={form.description}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Collection description..."
                            />
                        </div>

                        {feedback ? (
                            <p
                                className={`rounded-md px-3 py-2 text-sm ${
                                    feedback.ok
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-destructive/10 text-destructive"
                                }`}
                            >
                                {feedback.msg}
                            </p>
                        ) : null}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    void closeModal();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Saving..."
                                    : mode === "create"
                                      ? "Create Collection"
                                      : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete collection?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete
                            {deleteTarget
                                ? ` ${deleteTarget.name}`
                                : " this collection"}
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) {
                                    void handleDelete(deleteTarget.id);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
