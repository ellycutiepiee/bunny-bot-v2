import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkPremium(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (user?.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
        return true;
    }
    return false;
}

export async function addPremium(userId: string, durationDays: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await prisma.user.upsert({
        where: { id: userId },
        update: { premiumExpiresAt: expiresAt },
        create: { id: userId, premiumExpiresAt: expiresAt },
    });
}

export async function logSong(userId: string, title: string, author: string, url: string) {
    // Ensure user exists first
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
    });

    await prisma.songLog.create({
        data: {
            userId,
            title,
            author,
            url,
        },
    });
}

export default prisma;