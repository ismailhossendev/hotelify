
"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, FileText, Globe, Search, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPagesList() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/admin/pages');
            const data = await res.json();
            if (data.success) {
                setPages(data.pages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPages();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Pages</h1>
                    <p className="text-gray-400">Manage static content pages like About, Privacy, etc.</p>
                </div>
                <Link
                    href="/admin/pages/new"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                >
                    <Plus className="h-4 w-4" /> Create New
                </Link>
            </div>

            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search pages..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-purple-500" /></div> : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(page => (
                        <div key={page._id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-purple-900/30 group-hover:text-purple-400 transition-colors">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{page.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <code className="bg-gray-900 px-1 py-0.5 rounded text-xs text-blue-300">/{page.slug}</code>
                                        <span className={page.isActive ? "text-green-400" : "text-red-400"}>
                                            {page.isActive ? "Published" : "Draft"}
                                        </span>
                                        <span>• Last updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/${page.slug}`}
                                    target="_blank"
                                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="View Live"
                                >
                                    <Globe className="h-4 w-4" />
                                </a>
                                <Link
                                    href={`/admin/pages/${page._id}`}
                                    className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(page._id)}
                                    className="p-2 hover:bg-gray-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                            No pages found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
