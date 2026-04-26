"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useState } from "react";

type SubmitState =
    | { status: "idle" }
    | { status: "sending" }
    | { status: "success"; message: string }
    | { status: "error"; message: string };

export function ContactForm() {
    const [state, setState] = useState<SubmitState>({ status: "idle" });

    const isSending = state.status === "sending";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const firstName = String(formData.get("firstName") ?? "").trim();
        const lastName = String(formData.get("lastName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const message = String(formData.get("message") ?? "").trim();

        setState({ status: "sending" });

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    message,
                }),
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                setState({
                    status: "error",
                    message:
                        data?.message ??
                        "We could not send your message. Please try again.",
                });
                return;
            }

            form.reset();
            setState({
                status: "success",
                message:
                    data?.message ??
                    "Your message has been sent. We will be in touch shortly.",
            });
        } catch {
            setState({
                status: "error",
                message:
                    "Network error. Please check your connection and try again.",
            });
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="min-w-0 h-fit rounded-2xl border border-[#e2e8f0] bg-white/85 p-4 pt-5 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.45)] sm:p-6 md:p-8"
        >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Contact Form
            </p>
            <h2 className="text-3xl font-semibold text-[#1e293b] sm:text-4xl md:text-5xl">
                Inquiry
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#7c8da0] sm:text-base sm:leading-7 md:text-xl md:leading-9">
                Whether you are a private client seeking a bespoke piece or a
                global partner, our team is dedicated to providing an
                unparalleled experience.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                    First Name
                    <Input
                        name="firstName"
                        required
                        className="mt-2 h-12 w-full rounded-xl border border-[#dce4ed] bg-[#fcfcfb] px-4 text-base text-[#64748b] sm:text-lg"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First name"
                    />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                    Last Name
                    <Input
                        name="lastName"
                        required
                        className="mt-2 h-12 w-full rounded-xl border border-[#dce4ed] bg-[#fcfcfb] px-4 text-base text-[#64748b] sm:text-lg"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Last name"
                    />
                </label>
            </div>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                Email Address
                <Input
                    name="email"
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-[#dce4ed] bg-[#fcfcfb] px-4 text-base text-[#64748b] sm:text-lg"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                />
            </label>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                Message
                <Textarea
                    name="message"
                    required
                    className="mt-2 min-h-32 w-full rounded-xl border border-[#dce4ed] bg-[#fcfcfb] px-4 py-3 text-base text-[#64748b] sm:text-lg"
                    placeholder="How can we assist you today?"
                />
            </label>

            <Button
                type="submit"
                disabled={isSending}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-sm bg-[#0f1b34] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-70 sm:mt-10 sm:text-sm"
            >
                {isSending ? "Sending..." : "Send Message ▸"}
            </Button>

            {state.status === "success" ? (
                <p className="mt-4 text-sm text-emerald-700">{state.message}</p>
            ) : null}

            {state.status === "error" ? (
                <p className="mt-4 text-sm text-red-600">{state.message}</p>
            ) : null}
        </form>
    );
}
