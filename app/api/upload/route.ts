import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No file" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName =
    Date.now() + "-" + file.name.replace(/\s/g, "-");

  const uploadDir = path.join(process.cwd(), "public/uploads");

  await fs.mkdir(uploadDir, {
    recursive: true,
  });

  await fs.writeFile(
    path.join(uploadDir, fileName),
    buffer
  );

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}