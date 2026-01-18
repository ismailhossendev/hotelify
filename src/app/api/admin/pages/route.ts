
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Page } from '@/lib/db/models/Page';
import { getCurrentUser } from '@/lib/auth/token';

// GET all pages
export async function GET() {
    try {
        await connectDB();
        const pages = await Page.find().sort({ title: 1 });
        return NextResponse.json({ success: true, pages });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST create/update page
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        // Check if user is super_admin
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { _id, title, slug, content, seoTitle, seoDescription, isActive } = body;

        let page;
        if (_id) {
            // Update
            page = await Page.findByIdAndUpdate(_id, {
                title, slug, content, seoTitle, seoDescription, isActive
            }, { new: true });
        } else {
            // Create
            // Ensure unique slug
            const existing = await Page.findOne({ slug });
            if (existing) {
                return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
            }
            page = await Page.create({ title, slug, content, seoTitle, seoDescription, isActive });
        }

        return NextResponse.json({ success: true, page });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE page
export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await connectDB();
        await Page.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
