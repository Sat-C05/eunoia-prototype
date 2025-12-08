let cachedId: string | null = null;

function generateId() {
    return "user_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateClientUserId(): string {
    if (typeof window === "undefined") {
        // Should only be called from client components, but fall back just in case.
        return "anonymous";
    }

    if (cachedId) return cachedId;

    const existing = window.localStorage.getItem("eunoia_user_id");
    if (existing && typeof existing === "string") {
        cachedId = existing;
        return existing;
    }

    const next = generateId();
    window.localStorage.setItem("eunoia_user_id", next);
    cachedId = next;
    return next;
}
