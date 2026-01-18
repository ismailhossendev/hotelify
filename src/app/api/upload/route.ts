
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + Math.random().toString(36).substring(7) + path.extname(file.name);

        // Ensure uploads directory exists (Next.js public folder)
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // In Local Dev, we save to public/uploads. 
        // Note: In Vercel/Production, this ephemeral storage won't persist. 
        // Ideally use S3/Cloudinary. This is for local demonstration.

        try {
            // Simple check if directory exists, if not basic node fs might error, 
            // but usually public folder exists in Next.js structure.
            await writeFile(path.join(uploadDir, filename), buffer);
        } catch (e) {
            // Fallback for demo environments where writing to public might fail or if folder missing
            return NextResponse.json({ error: "Upload failed: Filesystem permission or missing folder" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

        // Extract filename from URL
        const filename = url.split('/').pop();
        if (!filename) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

        const filepath = path.join(process.cwd(), "public", "uploads", filename);

        try {
            await unlink(filepath);
        } catch (e: any) {
            // Ignore if file already missing
            if (e.code !== 'ENOENT') console.error("Error deleting file:", e);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
