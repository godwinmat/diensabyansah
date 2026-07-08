"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AccountProfileFormProps = {
    initialName: string;
    initialEmail: string;
};

export function AccountProfileForm({
    initialName,
    initialEmail,
}: AccountProfileFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
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
            const response = await fetch("/api/account/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    currentPassword,
                    newPassword,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
                user?: { name?: string; email?: string };
            } | null;

            if (!response.ok || !data?.user) {
                setFeedback({
                    type: "error",
                    text: data?.message ?? "Unable to save your profile.",
                });
                return;
            }

            setName(data.user.name ?? name);
            setEmail(data.user.email ?? email);
            setCurrentPassword("");
            setNewPassword("");
            setFeedback({
                type: "success",
                text: data.message ?? "Profile updated successfully.",
            });
            router.refresh();
        } catch {
            setFeedback({
                type: "error",
                text: "Unable to save your profile.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="gap-0 rounded-2xl border border-[#e2e8f0] bg-white/92 py-0 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.4)]">
            <CardHeader className="border-b border-[#e2e8f0] px-5 py-5 sm:px-6">
                <CardTitle className="text-2xl">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5 sm:px-6">
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-name">Name</Label>
                        <Input
                            id="profile-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Your full name"
                            className="h-11"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@example.com"
                            className="h-11"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="profile-current-password">
                            Current Password
                        </Label>
                        <Input
                            id="profile-current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            placeholder="Confirm your password"
                            className="h-11"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="profile-new-password">
                            New Password (optional)
                        </Label>
                        <Input
                            id="profile-new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            placeholder="Leave blank to keep your current password"
                            className="h-11"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="h-11"
                        >
                            {saving ? "Saving..." : "Save Changes"}
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
