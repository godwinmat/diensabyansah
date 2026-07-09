"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatCircleDots, X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

type ChatState = {
    name: string;
    email: string;
    phone: string;
};

export function FloatingChatWidget() {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<ChatState>({
        name: "",
        email: "",
        phone: "",
    });
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleChange = (key: keyof ChatState, value: string) => {
        setState((current) => ({ ...current, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!message.trim()) {
            setFeedback({ type: "error", text: "Please type a message." });
            return;
        }

        if (!state.email.trim() || !state.phone.trim()) {
            setFeedback({
                type: "error",
                text: "Please provide your email and phone number.",
            });
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: state.name,
                    email: state.email,
                    phone: state.phone,
                    message,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                setFeedback({
                    type: "error",
                    text: data?.message ?? "Unable to send message.",
                });
                return;
            }

            setMessage("");
            setFeedback({
                type: "success",
                text: data?.message ?? "Message sent successfully.",
            });
        } catch {
            setFeedback({
                type: "error",
                text: "Unable to send message.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {open ? (
                <div className="w-[min(90vw,360px)] rounded-2xl border border-border bg-white/95 p-4 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.5)] backdrop-blur">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                                Contact Concierge
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Share your details and message our team.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="grid h-8 w-8 place-items-center rounded-full border text-muted-foreground transition hover:text-foreground"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="chat-name">
                                    Name (optional)
                                </Label>
                                <Input
                                    id="chat-name"
                                    value={state.name}
                                    onChange={(event) =>
                                        handleChange("name", event.target.value)
                                    }
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="chat-email">Email</Label>
                                <Input
                                    id="chat-email"
                                    type="email"
                                    value={state.email}
                                    onChange={(event) =>
                                        handleChange(
                                            "email",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="chat-phone">Phone</Label>
                                <Input
                                    id="chat-phone"
                                    value={state.phone}
                                    onChange={(event) =>
                                        handleChange(
                                            "phone",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="+237..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="chat-message">Message</Label>
                            <Textarea
                                id="chat-message"
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                placeholder="Tell us what you are looking for..."
                                rows={4}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full"
                        >
                            {submitting ? "Sending..." : "Send Message"}
                        </Button>

                        {feedback ? (
                            <p
                                className={`text-xs ${
                                    feedback.type === "success"
                                        ? "text-emerald-600"
                                        : "text-destructive"
                                }`}
                            >
                                {feedback.text}
                            </p>
                        ) : null}
                    </form>
                </div>
            ) : null}

            {!open ? (
                <Button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="h-13 w-13 rounded-full shadow-[0_14px_35px_-18px_rgba(15,23,42,0.55)]"
                    aria-label="Open contact chat"
                >
                    <ChatCircleDots size={24} weight="fill" />
                </Button>
            ) : null}
        </div>
    );
}
