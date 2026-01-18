
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Layout, Globe, Search } from 'lucide-react';
import Link from 'next/link';

function Editor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Only set content if it's materially different to avoid cursor jumps/loops
            // Use this carefully
            if (editor.getText().trim() === "" && content.length > 0) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-800 border-b border-gray-700 p-2 flex flex-wrap gap-2">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Bold</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Italic</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>H2</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>H3</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Bullet List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-700 text-white' : 'text-gray-400'}`}>Ordered List</button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}

export default function EditPage({ params }: { params: { id: string } }) {
    const isNew = params.id === 'new';
    const router = useRouter();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        seoTitle: '',
        seoDescription: '',
        isActive: true
    });

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/admin/pages?id=${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.pages) {
                        // The API returns list, so we filter. Or update API to get one. 
                        // Wait, previous API code returned `pages` array for GET. I should update API to handle ID param or filter here.
                        // I'll filter here for simplicity as I didn't verify single GET in API.
                        const page = data.pages.find((p: any) => p._id === params.id);
                        if (page) setFormData(page);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [params.id, isNew]);

    const handleSave = async () => {
        if (!formData.title || !formData.slug) return alert("Title and Slug are required");
        setSaving(true);
        try {
            const payload = isNew ? formData : { ...formData, _id: params.id };
            const res = await fetch('/api/admin/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                router.push('/admin/pages');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/pages" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{isNew ? 'Create New Page' : 'Edit Page'}</h1>
                    <p className="text-gray-400 text-sm">Design your page content</p>
                </div>
                <div className="ml-auto flex gap-3">
                    {!isNew && (
                        <a href={`/${formData.slug}`} target="_blank" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Globe className="h-4 w-4" /> View Live
                        </a>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Editor */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2">Page Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-gray-900 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold"
                                placeholder="e.g. Terms & Conditions"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Content (HTML)</label>
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-gray-900 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm h-[400px]"
                                placeholder="<p>Enter your page content here...</p>"
                            />
                            <p className="text-xs text-gray-500 mt-2">Basic HTML is supported.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Settings Sidebar */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
                        <h3 className="font-bold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                            <Layout className="h-4 w-4 text-blue-400" /> Page Settings
                        </h3>

                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">URL Slug</label>
                            <div className="flex items-center">
                                <span className="bg-gray-900 border border-r-0 border-gray-700 text-gray-500 p-2 rounded-l-lg text-sm">/</span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-gray-900 border-gray-700 rounded-r-lg p-2 text-white text-sm"
                                    placeholder="about-us"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                            <span className="text-gray-300 text-sm font-medium">Published Status</span>
                            <button
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-green-500' : 'bg-gray-700'}`}
                            >
                                <span className={`absolute top-1 path-1 bg-white h-4 w-4 rounded-full transition-transform ${formData.isActive ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
                        <h3 className="font-bold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                            <Search className="h-4 w-4 text-orange-400" /> SEO Metadata
                        </h3>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Meta Title</label>
                            <input
                                type="text"
                                value={formData.seoTitle || formData.title}
                                onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                                className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Meta Description</label>
                            <textarea
                                value={formData.seoDescription}
                                onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                                className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white text-sm h-24 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
