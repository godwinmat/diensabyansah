import {
    getSupabaseAdminClient,
    getSupabaseStorageBucket,
} from "@/lib/supabase-admin";

function getStoragePathFromPublicUrl(url: string) {
    const marker = "/storage/v1/object/public/";
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
        return null;
    }

    const remainder = url.slice(markerIndex + marker.length);
    const firstSlash = remainder.indexOf("/");

    if (firstSlash === -1) {
        return null;
    }

    const path = decodeURIComponent(remainder.slice(firstSlash + 1).trim());
    return path || null;
}

export async function deleteImageFromSupabaseStorage(imageUrl?: string | null) {
    const url = imageUrl?.trim();
    if (!url) {
        return;
    }

    const path = getStoragePathFromPublicUrl(url);
    if (!path) {
        return;
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return;
    }

    const bucket = getSupabaseStorageBucket();
    await supabase.storage.from(bucket).remove([path]);
}
