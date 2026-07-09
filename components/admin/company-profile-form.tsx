"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanyProfileData } from "@/lib/company-profile";
import { useState } from "react";

type CompanyProfileFormProps = {
    initialProfile: CompanyProfileData;
};

export function CompanyProfileForm({
    initialProfile,
}: CompanyProfileFormProps) {
    const [form, setForm] = useState<CompanyProfileData>(initialProfile);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleChange = (key: keyof CompanyProfileData, value: string) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/admin-panel/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
                profile?: CompanyProfileData;
            } | null;

            if (!response.ok || !data?.profile) {
                setFeedback({
                    type: "error",
                    text: data?.message ?? "Unable to save company profile.",
                });
                return;
            }

            setForm(data.profile);
            setFeedback({
                type: "success",
                text: data.message ?? "Company profile saved.",
            });
        } catch {
            setFeedback({
                type: "error",
                text: "Unable to save company profile.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle>Core Branding</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            value={form.companyName}
                            onChange={(event) =>
                                handleChange("companyName", event.target.value)
                            }
                            placeholder="Diensa by Ansah"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            value={form.contactEmail}
                            onChange={(event) =>
                                handleChange("contactEmail", event.target.value)
                            }
                            placeholder="info@diensabyansah.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support Email</Label>
                        <Input
                            id="supportEmail"
                            type="email"
                            value={form.supportEmail}
                            onChange={(event) =>
                                handleChange("supportEmail", event.target.value)
                            }
                            placeholder="hello@diensa-ansah.cm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phonePrimary">Primary Phone</Label>
                        <Input
                            id="phonePrimary"
                            value={form.phonePrimary}
                            onChange={(event) =>
                                handleChange("phonePrimary", event.target.value)
                            }
                            placeholder="+237 233 44 55 66"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneSecondary">Secondary Phone</Label>
                        <Input
                            id="phoneSecondary"
                            value={form.phoneSecondary}
                            onChange={(event) =>
                                handleChange(
                                    "phoneSecondary",
                                    event.target.value,
                                )
                            }
                            placeholder="Optional"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="craftedInLabel">
                            Footer Craft Label
                        </Label>
                        <Input
                            id="craftedInLabel"
                            value={form.craftedInLabel}
                            onChange={(event) =>
                                handleChange(
                                    "craftedInLabel",
                                    event.target.value,
                                )
                            }
                            placeholder="Crafted in Cameroon"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currencyCode">Currency Code</Label>
                        <Input
                            id="currencyCode"
                            value={form.currencyCode}
                            onChange={(event) =>
                                handleChange(
                                    "currencyCode",
                                    event.target.value.toUpperCase(),
                                )
                            }
                            placeholder="XAF"
                            maxLength={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currencySymbol">Currency Symbol</Label>
                        <Input
                            id="currencySymbol"
                            value={form.currencySymbol}
                            onChange={(event) =>
                                handleChange(
                                    "currencySymbol",
                                    event.target.value,
                                )
                            }
                            placeholder="FCFA"
                            maxLength={6}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Address & Contact Page</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="addressLine1">Address Line 1</Label>
                        <Input
                            id="addressLine1"
                            value={form.addressLine1}
                            onChange={(event) =>
                                handleChange("addressLine1", event.target.value)
                            }
                            placeholder="Avenue de l'Independance"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                            id="addressLine2"
                            value={form.addressLine2}
                            onChange={(event) =>
                                handleChange("addressLine2", event.target.value)
                            }
                            placeholder="Bonanjo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={form.city}
                            onChange={(event) =>
                                handleChange("city", event.target.value)
                            }
                            placeholder="Douala"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stateRegion">State / Region</Label>
                        <Input
                            id="stateRegion"
                            value={form.stateRegion}
                            onChange={(event) =>
                                handleChange("stateRegion", event.target.value)
                            }
                            placeholder="Littoral Region"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                            id="postalCode"
                            value={form.postalCode}
                            onChange={(event) =>
                                handleChange("postalCode", event.target.value)
                            }
                            placeholder="Optional"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={form.country}
                            onChange={(event) =>
                                handleChange("country", event.target.value)
                            }
                            placeholder="Cameroon"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="businessHours">Business Hours</Label>
                        <Textarea
                            id="businessHours"
                            value={form.businessHours}
                            onChange={(event) =>
                                handleChange(
                                    "businessHours",
                                    event.target.value,
                                )
                            }
                            rows={4}
                            placeholder="Mon - Fri: 09:00 AM - 06:00 PM"
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="mapEmbedUrl">
                            Google Maps Embed URL
                        </Label>
                        <Input
                            id="mapEmbedUrl"
                            value={form.mapEmbedUrl}
                            onChange={(event) =>
                                handleChange("mapEmbedUrl", event.target.value)
                            }
                            placeholder="https://www.google.com/maps/embed?..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Company Profile"}
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
    );
}
