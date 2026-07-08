import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;

function getSupabaseUrl() {
    return process.env.SUPABASE_URL?.trim() || "";
}

function getSupabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

export function getSupabaseStorageBucket() {
    return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "media-assets";
}

export function getSupabaseAdminClient() {
    if (cachedClient !== undefined) {
        return cachedClient;
    }

    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    if (!supabaseUrl || !serviceRoleKey) {
        cachedClient = null;
        return cachedClient;
    }

    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return cachedClient;
}
