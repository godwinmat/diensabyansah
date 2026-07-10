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
import { formatDisplayPrice } from "@/lib/cart";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const DEFAULT_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export type AdminProduct = {
    id: string;
    externalId: number;
    slug: string;
    name: string;
    price: string;
    imageUrl: string;
    note: string;
    description: string;
    origin: string;
    material: string;
    permalink: string | null;
    sizes: string[];
    collections: Array<{ name: string; slug: string }>;
    createdAt: string;
};

export type SlimCollection = {
    id: string;
    name: string;
    slug: string;
};

type FormState = {
    name: string;
    slug: string;
    price: string;
    imageUrl: string;
    note: string;
    description: string;
    origin: string;
    material: string;
    permalink: string;
    externalId: string;
    sizes: string[];
    collectionSlugs: string[];
};

const empty: FormState = {
    name: "",
    slug: "",
    price: "",
    imageUrl: "",
    note: "",
    description: "",
    origin: "",
    material: "",
    permalink: "",
    externalId: "",
    sizes: [],
    collectionSlugs: [],
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

function sanitizePriceInput(value: string) {
    const withoutCommas = value.replace(/,/g, ".");
    const cleaned = withoutCommas.replace(/[^0-9.]/g, "");
    const firstDot = cleaned.indexOf(".");

    if (firstDot === -1) {
        return cleaned;
    }

    const integerPart = cleaned.slice(0, firstDot + 1);
    const decimalPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
    return `${integerPart}${decimalPart}`;
}

function normalizePriceForSave(value: string) {
    const cleaned = sanitizePriceInput(value).trim();

    if (!cleaned) {
        return "";
    }

    const amount = Number(cleaned);
    if (!Number.isFinite(amount) || amount < 0) {
        return "";
    }

    return amount.toFixed(2);
}

function getStoragePathFromUrl(url: string) {
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
        return null;
    }

    const remainder = url.slice(markerIndex + marker.length);
    const firstSlash = remainder.indexOf("/");

    if (firstSlash === -1) {
        return null;
    }

    return decodeURIComponent(remainder.slice(firstSlash + 1));
}

export function ProductsTable({
    initialProducts,
    availableCollections,
    currencySymbol,
}: {
    initialProducts: AdminProduct[];
    availableCollections: SlimCollection[];
    currencySymbol: string;
}) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(empty);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        ok: boolean;
        msg: string;
    } | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState("");
    const [pendingUploadedImagePath, setPendingUploadedImagePath] = useState<
        string | null
    >(null);
    const [sizePicker, setSizePicker] = useState("");
    const [collectionPicker, setCollectionPicker] = useState("");

    const sizeOptions = useMemo(() => {
        const knownSizes = new Set(DEFAULT_SIZE_OPTIONS);
        for (const product of initialProducts) {
            for (const size of product.sizes) {
                const normalized = size.trim();
                if (normalized) {
                    knownSizes.add(normalized);
                }
            }
        }
        return Array.from(knownSizes).filter(
            (size) => size.toLowerCase() !== "one size",
        );
    }, [initialProducts]);

    const selectedSizes = useMemo(
        () =>
            Array.from(
                new Set(form.sizes.map((size) => size.trim()).filter(Boolean)),
            ),
        [form.sizes],
    );

    const selectedCollectionSlugs = useMemo(
        () =>
            Array.from(
                new Set(
                    form.collectionSlugs
                        .map((collectionSlug) => collectionSlug.trim())
                        .filter(Boolean),
                ),
            ),
        [form.collectionSlugs],
    );

    const collectionNameBySlug = useMemo(
        () =>
            new Map(
                availableCollections.map((collection) => [
                    collection.slug,
                    collection.name,
                ]),
            ),
        [availableCollections],
    );

    const openCreate = () => {
        setForm(empty);
        setSizePicker("");
        setCollectionPicker("");
        setOriginalImageUrl("");
        setPendingUploadedImagePath(null);
        setMode("create");
        setEditId(null);
        setFeedback(null);
        setModalOpen(true);
    };

    const openEdit = (product: AdminProduct) => {
        setForm({
            name: product.name,
            slug: product.slug,
            price: product.price,
            imageUrl: product.imageUrl,
            note: product.note,
            description: product.description,
            origin: product.origin,
            material: product.material,
            permalink: product.permalink ?? "",
            externalId: String(product.externalId),
            sizes: product.sizes,
            collectionSlugs: product.collections.map((c) => c.slug),
        });
        setSizePicker("");
        setCollectionPicker("");
        setOriginalImageUrl(product.imageUrl);
        setPendingUploadedImagePath(null);
        setMode("edit");
        setEditId(product.id);
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
        setSizePicker("");
        setCollectionPicker("");
        setOriginalImageUrl("");
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

    const f =
        <K extends keyof FormState>(key: K) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((p) => ({ ...p, [key]: e.target.value }));

    const handlePriceChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            price: sanitizePriceInput(value),
        }));
    };

    const handlePriceBlur = () => {
        setForm((prev) => {
            const normalized = normalizePriceForSave(prev.price);
            return { ...prev, price: normalized || prev.price.trim() };
        });
    };

    const handleSizePick = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value.trim();

        if (!value) {
            setSizePicker("");
            return;
        }

        setForm((prev) => {
            if (prev.sizes.includes(value)) {
                return prev;
            }

            return { ...prev, sizes: [...prev.sizes, value] };
        });

        setSizePicker("");
    };

    const removeSize = (sizeToRemove: string) => {
        setForm((prev) => {
            const nextSizes = prev.sizes.filter(
                (size) => size !== sizeToRemove,
            );
            return { ...prev, sizes: nextSizes };
        });
    };

    const handleCollectionPick = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const value = event.target.value.trim();

        if (!value) {
            setCollectionPicker("");
            return;
        }

        setForm((prev) => {
            if (prev.collectionSlugs.includes(value)) {
                return prev;
            }

            return {
                ...prev,
                collectionSlugs: [...prev.collectionSlugs, value],
            };
        });

        setCollectionPicker("");
    };

    const removeCollection = (slugToRemove: string) => {
        setForm((prev) => ({
            ...prev,
            collectionSlugs: prev.collectionSlugs.filter(
                (slug) => slug !== slugToRemove,
            ),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        if (!form.imageUrl.trim()) {
            setFeedback({
                ok: false,
                msg: "Please upload a product image before saving.",
            });
            setIsSubmitting(false);
            return;
        }

        const normalizedPrice = normalizePriceForSave(form.price);
        if (!normalizedPrice) {
            setFeedback({
                ok: false,
                msg: "Please enter a valid numeric price.",
            });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            name: form.name,
            slug: form.slug,
            price: normalizedPrice,
            imageUrl: form.imageUrl,
            note: form.note,
            description: form.description,
            origin: form.origin,
            material: form.material,
            permalink: form.permalink || null,
            externalId: form.externalId || undefined,
            sizes: Array.from(
                new Set(form.sizes.map((size) => size.trim()).filter(Boolean)),
            ),
            collectionSlugs: form.collectionSlugs,
        };

        try {
            const url =
                mode === "create"
                    ? "/api/admin-panel/products"
                    : `/api/admin-panel/products/${editId}`;
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
                    mode === "create" ? "Product created." : "Product updated.",
            });

            const replacedExistingImage =
                mode === "edit" &&
                Boolean(originalImageUrl) &&
                originalImageUrl !== form.imageUrl;

            if (replacedExistingImage) {
                const oldPath = getStoragePathFromUrl(originalImageUrl);
                if (oldPath) {
                    await deleteUploadedImageByPath(oldPath);
                }
            }

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
            formData.append("entity", "products");
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
        const res = await fetch(`/api/admin-panel/products/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
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
                        {products.length} product
                        {products.length !== 1 ? "s" : ""}
                    </CardTitle>
                    <Button type="button" onClick={openCreate}>
                        New Product
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/60 hover:bg-muted/60">
                                <TableHead>#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Collections</TableHead>
                                <TableHead>Sizes</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No products yet. Create your first one.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {product.externalId}
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="max-w-40 truncate font-mono text-xs text-muted-foreground">
                                        {product.slug}
                                    </TableCell>
                                    <TableCell>
                                        {formatDisplayPrice(
                                            product.price,
                                            currencySymbol,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.collections.length ===
                                            0 ? (
                                                <span className="text-muted-foreground">
                                                    -
                                                </span>
                                            ) : null}
                                            {product.collections
                                                .slice(0, 2)
                                                .map((collection) => (
                                                    <Badge
                                                        key={collection.slug}
                                                        variant="secondary"
                                                    >
                                                        {collection.name}
                                                    </Badge>
                                                ))}
                                            {product.collections.length > 2 ? (
                                                <Badge variant="outline">
                                                    +
                                                    {product.collections
                                                        .length - 2}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    -
                                                </span>
                                            ) : null}
                                            {product.sizes
                                                .slice(0, 3)
                                                .map((size) => (
                                                    <Badge
                                                        key={size}
                                                        variant="outline"
                                                    >
                                                        {size}
                                                    </Badge>
                                                ))}
                                            {product.sizes.length > 3 ? (
                                                <Badge variant="outline">
                                                    +{product.sizes.length - 3}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(product.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="secondary"
                                                onClick={() =>
                                                    openEdit(product)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        id: product.id,
                                                        name: product.name,
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
                            {mode === "create" ? "New Product" : "Edit Product"}
                        </DialogTitle>
                        <DialogDescription>
                            Manage catalogue details, sizing, and collection
                            links.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-name">Name</Label>
                                <Input
                                    id="product-name"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        handleNameChange(e.target.value)
                                    }
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-slug">Slug</Label>
                                <Input
                                    id="product-slug"
                                    required
                                    value={form.slug}
                                    onChange={f("slug")}
                                    className="font-mono"
                                    placeholder="product-slug"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-price">Price</Label>
                                <Input
                                    id="product-price"
                                    required
                                    value={form.price}
                                    onChange={(e) =>
                                        handlePriceChange(e.target.value)
                                    }
                                    onBlur={handlePriceBlur}
                                    inputMode="decimal"
                                    placeholder="120.00"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter amount only. Currency sign is added
                                    automatically where needed.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-external-id">
                                    External ID
                                </Label>
                                <Input
                                    id="product-external-id"
                                    type="number"
                                    value={form.externalId}
                                    onChange={f("externalId")}
                                    placeholder="Auto-assigned if blank"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-image">Product Image</Label>
                            <Input
                                id="product-image"
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
                                <Label htmlFor="product-origin">Origin</Label>
                                <Input
                                    id="product-origin"
                                    required
                                    value={form.origin}
                                    onChange={f("origin")}
                                    placeholder="Made in Cameroon"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-material">
                                    Material
                                </Label>
                                <Input
                                    id="product-material"
                                    required
                                    value={form.material}
                                    onChange={f("material")}
                                    placeholder="Adire cotton"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-size-picker">
                                    Sizes
                                </Label>
                                <select
                                    id="product-size-picker"
                                    value={sizePicker}
                                    onChange={handleSizePick}
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-medium text-slate-900 shadow-inner outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select a size</option>
                                    {sizeOptions.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex flex-wrap gap-1">
                                    {selectedSizes.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">
                                            No sizes selected yet.
                                        </span>
                                    ) : (
                                        selectedSizes.map((size) => (
                                            <Badge
                                                key={size}
                                                variant="outline"
                                                className="gap-1"
                                            >
                                                <span>{size}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSize(size)
                                                    }
                                                    aria-label={`Remove ${size}`}
                                                    className="text-muted-foreground transition hover:text-foreground"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-collections">
                                    Collections
                                </Label>
                                <select
                                    id="product-collections"
                                    value={collectionPicker}
                                    onChange={handleCollectionPick}
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">
                                        Select a collection
                                    </option>
                                    {availableCollections.map((collection) => (
                                        <option
                                            key={collection.id}
                                            value={collection.slug}
                                        >
                                            {collection.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex flex-wrap gap-1">
                                    {selectedCollectionSlugs.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">
                                            No collections selected yet.
                                        </span>
                                    ) : (
                                        selectedCollectionSlugs.map((slug) => (
                                            <Badge
                                                key={slug}
                                                variant="secondary"
                                                className="gap-1"
                                            >
                                                <span>
                                                    {collectionNameBySlug.get(
                                                        slug,
                                                    ) ?? slug}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeCollection(slug)
                                                    }
                                                    aria-label={`Remove ${collectionNameBySlug.get(slug) ?? slug}`}
                                                    className="text-muted-foreground transition hover:text-foreground"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-permalink">Permalink</Label>
                            <Input
                                id="product-permalink"
                                type="url"
                                value={form.permalink}
                                onChange={f("permalink")}
                                placeholder="https://... (optional)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-note">Short Note</Label>
                            <Input
                                id="product-note"
                                required
                                value={form.note}
                                onChange={f("note")}
                                placeholder="One-line teaser shown in cards"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">
                                Description
                            </Label>
                            <Textarea
                                id="product-description"
                                required
                                rows={6}
                                value={form.description}
                                onChange={f("description")}
                                placeholder="Full product description..."
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
                                      ? "Create Product"
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
                        <DialogTitle>Delete product?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete
                            {deleteTarget
                                ? ` ${deleteTarget.name}`
                                : " this product"}
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
