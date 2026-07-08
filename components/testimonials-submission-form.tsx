"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TestimonialsSubmissionFormProps = {
    authenticated: boolean;
};

type SubmissionType = "TEXT" | "VIDEO";

export function TestimonialsSubmissionForm({
    authenticated,
}: TestimonialsSubmissionFormProps) {
    const router = useRouter();
    const [type, setType] = useState<SubmissionType>("TEXT");
    const [text, setText] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!authenticated) {
            router.push("/account");
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const formData = new FormData();
            formData.set("type", type);

            if (type === "TEXT") {
                formData.set("text", text);
            }

            if (type === "VIDEO" && videoFile) {
                formData.set("file", videoFile);
            }

            const response = await fetch("/api/testimonials", {
                method: "POST",
                body: formData,
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                setFeedback({
                    type: "error",
                    text: data?.message ?? "Unable to submit testimony.",
                });
                return;
            }

            setText("");
            setVideoFile(null);
            setFeedback({
                type: "success",
                text: data?.message ?? "Your testimony has been submitted.",
            });
            router.refresh();
        } catch {
            setFeedback({
                type: "error",
                text: "Unable to submit testimony.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-start">
                <Button
                    type="button"
                    variant={type === "TEXT" ? "default" : "outline"}
                    className={`h-11 w-full rounded-none px-6 text-sm font-semibold uppercase tracking-[0.12em] sm:w-auto ${
                        type === "TEXT"
                            ? ""
                            : "border-white/25 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setType("TEXT")}
                >
                    Text Testimony
                </Button>
                <Button
                    type="button"
                    variant={type === "VIDEO" ? "default" : "outline"}
                    className={`h-11 w-full rounded-none px-6 text-sm font-semibold uppercase tracking-[0.12em] sm:w-auto ${
                        type === "VIDEO"
                            ? ""
                            : "border-white/25 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setType("VIDEO")}
                >
                    Video Testimony
                </Button>
            </div>

            {type === "TEXT" ? (
                <div className="space-y-2 text-left">
                    <Label
                        htmlFor="testimonial-text"
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85"
                    >
                        Your Testimony
                    </Label>
                    <Textarea
                        id="testimonial-text"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Share your experience with Diensa by Ansah"
                        className="min-h-36 rounded-xl border-white/25 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/55"
                        required={type === "TEXT"}
                    />
                </div>
            ) : (
                <div className="space-y-2 text-left">
                    <Label
                        htmlFor="testimonial-video"
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85"
                    >
                        Upload Video (Max 10MB)
                    </Label>
                    <Input
                        id="testimonial-video"
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        className="h-12 rounded-xl border-white/25 bg-white/10 px-3 text-white file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                        onChange={(event) =>
                            setVideoFile(event.target.files?.[0] ?? null)
                        }
                        required={type === "VIDEO"}
                    />
                    <p className="text-sm text-white/70">
                        Supported formats: MP4, MOV, WEBM.
                    </p>
                </div>
            )}

            <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-none bg-primary px-8 text-sm font-semibold uppercase tracking-[0.16em] text-white sm:w-auto"
            >
                {authenticated
                    ? submitting
                        ? "Submitting..."
                        : "Submit Testimony"
                    : "Sign In to Submit"}
            </Button>

            {feedback ? (
                <p
                    className={`text-sm ${feedback.type === "success" ? "text-emerald-300" : "text-red-300"}`}
                >
                    {feedback.text}
                </p>
            ) : null}
        </form>
    );
}
