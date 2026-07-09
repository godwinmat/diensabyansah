import { ChatInbox } from "@/components/admin/chat-inbox";
import { ChatReloadButton } from "@/components/admin/chat-reload-button";
import {
    getAdminCookieName,
    getAdminLoginPath,
    verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value ?? "";
    const adminSession = verifyAdminSessionToken(token);

    if (!adminSession) {
        redirect(getAdminLoginPath());
    }

    const messages = await prisma.inboxMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    const serializedMessages = messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Chat Inbox</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View incoming prospect messages.
                    </p>
                </div>
                <ChatReloadButton />
            </div>
            <ChatInbox initialMessages={serializedMessages} />
        </div>
    );
}
