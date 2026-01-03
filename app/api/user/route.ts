import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Ensure NextAuth provides ID (might need callback tweak)

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            history: {
                take: 10,
                orderBy: { playedAt: "desc" }
            }
        }
    });

    const isPremium = user?.premiumExpiresAt ? user.premiumExpiresAt > new Date() : false;

    return NextResponse.json({
        isPremium,
        history: user?.history || []
    });
}