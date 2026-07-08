"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type AdminAccountFormProps = {
    initialEmail: string;
};

export function AdminAccountForm({ initialEmail }: AdminAccountFormProps) {
    const [newEmail, setNewEmail] = useState(initialEmail);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/admin-panel/account", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword,
                    newEmail,
                    newPassword,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
                account?: { email?: string };
            } | null;

            if (!response.ok) {
                setFeedback({
                    type: "error",
                    text:
                        data?.message ?? "Unable to update admin credentials.",
                });
                return;
            }

            setCurrentPassword("");
            setNewPassword("");
            setNewEmail(data?.account?.email?.trim() || newEmail);
            setFeedback({
                type: "success",
                text:
                    data?.message ||
                    "Admin email/password updated successfully.",
            });
        } catch {
            setFeedback({
                type: "error",
                text: "Unable to update admin credentials.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Login Credentials</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            value={newEmail}
                            onChange={(event) =>
                                setNewEmail(event.target.value)
                            }
                            placeholder="admin@company.com"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="current-password">
                            Current Password
                        </Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            placeholder="Current admin password"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="new-password">
                            New Password (optional)
                        </Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            placeholder="Leave blank to keep current password"
                        />
                        <p className="text-xs text-muted-foreground">
                            If provided, new password must be at least 8
                            characters.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button type="submit" disabled={saving}>
                            {saving
                                ? "Updating..."
                                : "Update Admin Credentials"}
                        </Button>
                        {feedback ? (
                            <p
                                className={`text-sm ${
                                    feedback.type === "success"
                                        ? "text-emerald-600"
                                        : "text-destructive"
                                }`}
                            >
                                {feedback.text}
                            </p>
                        ) : null}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
