"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductsRefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 700);
    };

    return (
        <Button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="h-9 border-[#dce4ed] bg-white text-xs font-semibold uppercase tracking-[0.12em] text-[#1e293b]"
        >
            {isRefreshing ? "Refreshing..." : "Latest Arrivals"}
        </Button>
    );
}
