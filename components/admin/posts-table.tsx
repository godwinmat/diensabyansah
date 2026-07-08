"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export type AdminPost = {
    id: string;
    externalId: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    categories: string[];
    publishedAt: string | null;
    createdAt: string;
};

type FormState = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    categories: string;
    publishedAt: string;
};

const empty: FormState = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    categories: "",
    publishedAt: "",
};

function toSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function formatDate(iso: string | null) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function PostsTable({ initialPosts }: { initialPosts: AdminPost[] }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(empty);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        title: string;
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

    const openEdit = (post: AdminPost) => {
        setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            imageUrl: post.imageUrl,
            categories: post.categories.join(", "),
            publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : "",
        });
        setPendingUploadedImagePath(null);
        setMode("edit");
        setEditId(post.id);
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

    const handleTitleChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            title: value,
            slug:
                prev.slug === "" || prev.slug === toSlug(prev.title)
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
                msg: "Please upload a post image before saving.",
            });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: form.content,
            imageUrl: form.imageUrl,
            categories: form.categories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
            publishedAt: form.publishedAt || null,
        };

        try {
            const url =
                mode === "create"
                    ? "/api/admin-panel/posts"
                    : `/api/admin-panel/posts/${editId}`;
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
                msg: mode === "create" ? "Post created." : "Post updated.",
            });
            setPendingUploadedImagePath(null);
            router.refresh();
            const listRes = await fetch("/api/admin-panel/posts/list").catch(
                () => null,
            );
            if (!listRes?.ok) {
                setTimeout(() => {
                    void closeModal(false);
                    window.location.reload();
                }, 800);
                return;
            }
            void closeModal(false);
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
            formData.append("entity", "posts");
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
        const res = await fetch(`/api/admin-panel/posts/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setPosts((prev) => prev.filter((p) => p.id !== id));
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
                        {posts.length} post{posts.length !== 1 ? "s" : ""}
                    </CardTitle>
                    <Button type="button" onClick={openCreate}>
                        New Post
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/60 hover:bg-muted/60">
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Categories</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No posts yet. Create your first one.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="max-w-[220px] truncate font-medium">
                                        {post.title}
                                    </TableCell>
                                    <TableCell className="max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                                        {post.slug}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {post.categories.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    -
                                                </span>
                                            ) : null}
                                            {post.categories
                                                .slice(0, 3)
                                                .map((cat) => (
                                                    <Badge
                                                        key={cat}
                                                        variant="secondary"
                                                    >
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            {post.categories.length > 3 ? (
                                                <Badge variant="outline">
                                                    +
                                                    {post.categories.length - 3}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(post.publishedAt)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(post.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="secondary"
                                                onClick={() => openEdit(post)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        id: post.id,
                                                        title: post.title,
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
                                ? "New Blog Post"
                                : "Edit Blog Post"}
                        </DialogTitle>
                        <DialogDescription>
                            Save the article content and publishing details.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="post-title">Title</Label>
                                <Input
                                    id="post-title"
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        handleTitleChange(e.target.value)
                                    }
                                    placeholder="Post title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="post-slug">Slug</Label>
                                <Input
                                    id="post-slug"
                                    required
                                    value={form.slug}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            slug: e.target.value,
                                        }))
                                    }
                                    className="font-mono"
                                    placeholder="my-post-slug"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-image">Post Image</Label>
                            <Input
                                id="post-image"
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
                                <Label htmlFor="post-categories">
                                    Categories
                                </Label>
                                <Input
                                    id="post-categories"
                                    value={form.categories}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            categories: e.target.value,
                                        }))
                                    }
                                    placeholder="Fashion, Culture"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="post-published-at">
                                    Published At
                                </Label>
                                <Input
                                    id="post-published-at"
                                    type="datetime-local"
                                    value={form.publishedAt}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            publishedAt: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-excerpt">Excerpt</Label>
                            <Textarea
                                id="post-excerpt"
                                required
                                rows={3}
                                value={form.excerpt}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        excerpt: e.target.value,
                                    }))
                                }
                                placeholder="Short summary shown in listings..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="post-content">Content</Label>
                            <Textarea
                                id="post-content"
                                required
                                rows={12}
                                value={form.content}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        content: e.target.value,
                                    }))
                                }
                                placeholder="Full post content (HTML supported)..."
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
                                      ? "Create Post"
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
                        <DialogTitle>Delete post?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete
                            {deleteTarget
                                ? ` ${deleteTarget.title}`
                                : " this post"}
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
