import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        await createSession(user.id);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
