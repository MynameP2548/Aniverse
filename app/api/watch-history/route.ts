import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// POST /api/watch-history - upsert a watch record for the current user + episode
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { episodeId, progress } = await req.json();
  if (!episodeId) {
    return NextResponse.json({ error: "ไม่พบตอนที่ต้องการบันทึก" }, { status: 400 });
  }

  const record = await prisma.watchHistory.upsert({
    where: { userId_episodeId: { userId: session.user.id, episodeId } },
    update: { progress: progress ?? 0 },
    create: { userId: session.user.id, episodeId, progress: progress ?? 0 },
  });

  return NextResponse.json(record);
}
