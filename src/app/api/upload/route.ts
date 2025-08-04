import { NextRequest, NextResponse } from 'next/server';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  writeFileSync(filePath, buffer);

  const fileUrl = `/uploads/${file.name}`;
  return NextResponse.json({ url: fileUrl });
}
