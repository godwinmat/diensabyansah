"use client";

import { Button } from "@/components/ui/button";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

export function ChatReloadButton() {
    const router = useRouter();

    return (
        <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => router.refresh()}
        >
            <ArrowClockwise size={16} weight="bold" />
            Reload
        </Button>
    );
}
