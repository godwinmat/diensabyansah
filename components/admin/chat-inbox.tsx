"use client";

import { useEffect, useMemo, useState } from "react";

type InboxMessage = {
    id: string;
    source: "CHAT" | "CONTACT";
    name: string | null;
    email: string | null;
    phone: string | null;
    message: string;
    createdAt: string;
    updatedAt: string;
};

type ChatInboxProps = {
    initialMessages: InboxMessage[];
};

function formatTime(value: string) {
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ChatInbox({ initialMessages }: ChatInboxProps) {
    const [messages, setMessages] = useState<InboxMessage[]>(initialMessages);
    const [activeId, setActiveId] = useState(initialMessages[0]?.id ?? "");

    useEffect(() => {
        setMessages(initialMessages);
        setActiveId((currentActiveId) => {
            if (
                initialMessages.some(
                    (message) => message.id === currentActiveId,
                )
            ) {
                return currentActiveId;
            }

            return initialMessages[0]?.id ?? "";
        });
    }, [initialMessages]);

    const activeConversation = useMemo(
        () => messages.find((message) => message.id === activeId),
        [activeId, messages],
    );

    const refreshMessages = async () => {
        const response = await fetch("/api/admin-panel/chat", {
            method: "GET",
            cache: "no-store",
        });

        const data = (await response.json().catch(() => null)) as {
            messages?: InboxMessage[];
        } | null;

        if (response.ok && data?.messages) {
            setMessages(data.messages);
            if (!activeId && data.messages[0]) {
                setActiveId(data.messages[0].id);
            }
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="overflow-hidden rounded-xl border bg-card">
                <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">Incoming Messages</p>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground">
                            No messages yet.
                        </p>
                    ) : (
                        messages.map((message) => {
                            const selected = message.id === activeId;

                            return (
                                <button
                                    key={message.id}
                                    type="button"
                                    onClick={() => setActiveId(message.id)}
                                    className={`w-full border-b px-4 py-3 text-left transition-colors ${
                                        selected
                                            ? "bg-primary/10"
                                            : "hover:bg-muted/40"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-foreground">
                                            {message.name ||
                                                message.email ||
                                                "Anonymous"}
                                        </p>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                            {message.source}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {message.phone ||
                                            message.email ||
                                            "No contact details"}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                        {message.message}
                                    </p>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl border bg-card">
                {!activeConversation ? (
                    <div className="grid flex-1 place-items-center px-6 text-center text-sm text-muted-foreground">
                        Select a message.
                    </div>
                ) : (
                    <>
                        <header className="border-b px-4 py-3">
                            <p className="text-base font-semibold text-foreground">
                                {activeConversation.name ||
                                    activeConversation.email ||
                                    "Prospect"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {activeConversation.source} •{" "}
                                {activeConversation.email || "No email"}
                                {activeConversation.phone
                                    ? ` • ${activeConversation.phone}`
                                    : ""}
                            </p>
                        </header>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <article className="rounded-xl border bg-muted/30 p-4 text-sm">
                                <p className="whitespace-pre-wrap leading-7 text-foreground">
                                    {activeConversation.message}
                                </p>
                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    {formatTime(activeConversation.createdAt)}
                                </p>
                            </article>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
