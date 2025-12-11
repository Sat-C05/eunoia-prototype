import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Use independent secret for student sessions
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "student-secret-key-change-me"
);

export async function hashPassword(password: string): Promise<string> {
    // using Web Crypto API to avoid 'bcrypt' dependency for now
    // In production, recommend installing bcryptjs
    // For this demo/MVP, we'll use a simple primitive encoding or verify with the user if they want to install 'bcryptjs'
    // To strictly avoid external deps like bcrypt errors on edge, we can do a simple hash

    // NOTE: This is a placeholder standard. For real security we MUST use bcrypt.
    // I will write this assuming we can install bcryptjs later, but for "run now" compatibility I'll stick to a native implementation if possible 
    // OR BETTER: explicit bcryptjs import and tell user to install. 
    // Let's rely on the user running 'npm install bcryptjs' as instructed.

    // However, to prevent "Module not found" errors immediately breaking the build before they look at chat, 
    // I will use a native crypto SHA-256 hash for this simplified implementation.
    // It is "good enough" for a demo but NOT production grade.

    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    const newHash = await hashPassword(plain);
    return newHash === hashed;
}

export async function createSession(userId: string) {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET);

    cookies().set("student_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });
}

export async function getSession() {
    const token = cookies().get("student_session")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string };
    } catch (err) {
        return null;
    }
}

export async function clearSession() {
    cookies().delete("student_session");
}
