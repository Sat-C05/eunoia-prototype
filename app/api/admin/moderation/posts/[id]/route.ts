import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { action } = await req.json();

        if (action === "RESTORE") {
            await prisma.post.update({
                where: { id: params.id },
                data: { isFlagged: false }
            });
            return NextResponse.json({ success: true });
        }

        else if (action === "DELETE") {
            await prisma.post.delete({
                where: { id: params.id }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch {
        return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }
}
