import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ไม่พบ Episode ID",
        },
        { status: 400 }
      );
    }

    const episode =
      await prisma.episode.update({
        where: {
          id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
        select: {
          id: true,
          views: true,
        },
      });

    return NextResponse.json({
      success: true,
      views: episode.views,
    });
  } catch (error) {
    console.error(
      "INCREMENT EPISODE VIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถเพิ่มยอดวิวได้",
      },
      { status: 500 }
    );
  }
}