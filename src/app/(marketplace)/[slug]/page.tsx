
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/connect';
import { Page } from '@/lib/db/models/Page';
import { Mina } from 'next/font/google';

const mina = Mina({
    weight: ['400', '700'],
    subsets: ['bengali', 'latin'],
    display: 'swap',
});

// Force dynamic since we use DB
export const dynamic = 'force-dynamic';

async function getPage(slug: string) {
    await connectDB();
    // Case insensitive regex search for slug
    const page = await Page.findOne({ slug: { $regex: new RegExp(`^${slug}$`, 'i') }, isActive: true });
    return page;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const page = await getPage(params.slug);
    if (!page) return { title: 'Page Not Found' };

    return {
        title: page.seoTitle || page.title,
        description: page.seoDescription || `Read about ${page.title} on Hotelify`,
    };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
    const page = await getPage(params.slug);

    if (!page) {
        // If page not found, user specifically asked for "create not availabe page"
        // We can either redirect to 404 or show a custom "Under Construction / Not Available" UI.
        // Given the request "create not availabe page", I will render a nice "Not Available" state here.
        return (
            <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center p-4 ${mina.className}`}>
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">এই পৃষ্ঠাটি বর্তমানে উপলব্ধ নয়</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    আমরা এই পৃষ্ঠাটিতে কাজ করছি। অনুগ্রহ করে পরে আবার চেক করুন।<br />
                    (This page is currently not available)
                </p>
                <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                    হোম পেজে ফিরে যান
                </a>
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-12 max-w-4xl ${mina.className}`}>
            <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">{page.title}</h1>

            {/* Render HTML Content from Editor */}
            <div
                className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-600 hover:prose-a:text-blue-500"
                dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
        </div>
    );
}
