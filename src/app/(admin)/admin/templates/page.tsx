"use client";

import { useState, useEffect } from "react";
import { Layout, Upload, Star, Check, Trash2, Loader2, X, Sparkles, Eye, EyeOff } from "lucide-react";

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        thumbnail: "",
        previewUrl: "",
        category: "free"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Template uploaded successfully');
                setShowModal(false);
                setFormData({ name: "", description: "", thumbnail: "", previewUrl: "", category: "free" });
                fetchTemplates();
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error creating template');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Template Marketplace</h1>
                    <p className="text-gray-400">Manage hotel themes and layouts</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-bold"
                >
                    <Upload className="h-4 w-4" /> Upload Theme
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group">
                        <div className="h-48 bg-gray-700 relative overflow-hidden">
                            {template.thumbnail ? (
                                <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    <Layout className="h-12 w-12 opacity-50" />
                                </div>
                            )}

                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${template.category === 'free' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
                                    }`}>
                                    {template.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">{template.description || 'No description provided.'}</p>

                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                    <span>ID: {template._id.substring(0, 8)}...</span>
                                    <span>{template.category.toUpperCase()}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const prompt = `Create a complete, responsive hotel landing page using Next.js 14, Tailwind CSS, and Framer Motion. 
The components should be modular and consume data from the following API structure:

### API Endpoints (Simulated)
- HOTEL DATA: \`/api/public/hotels/[slug]\` -> Returns { name, description, amenities: [], coverImage, logo, contact: { phone, email, address } }
- ROOMS DATA: \`/api/public/hotels/[slug]/rooms\` -> Returns [{ name, price, capacity: { adults, children }, images: [{url}], amenities: [] }]

### Required Sections
1. **Hero Section**: Full-screen background image (coverImage), Hotel Name, Subtitle, and a Search Bar (Dates/Guests).
2. **Featured Rooms**: Grid of 3 highlighted rooms. Show Price, Capacity, and "Book Now" button.
3. **Amenities**: Grid of icons + text (Free WiFi, Pool, Spa, etc.).
4. **Gallery Preview**: Masonry or Carousel of hotel images.
5. **Footer**: Links, Newsletter, Contact Info.

### Design Theme: "${template.name}"
- **Style**: ${template.description || 'Modern, clean, and unique.'}
- **Category**: ${template.category} ( Adjust typography and spacing accordingly).
- **Colors**: Use a color palette that matches a ${template.category} vibe.

Please provide the complete code for the main page component and 2-3 key sub-components (Hero, RoomCard).`;
                                            navigator.clipboard.writeText(prompt);
                                            alert('Detailed AI Prompt copied! Paste this into your AI coding assistant.');
                                        }}
                                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-lg transition-colors border border-gray-600"
                                        title="Copy detailed technical prompt for AI"
                                    >
                                        <Sparkles className="h-3 w-3 text-yellow-400" />
                                        Copy AI Prompt
                                    </button>

                                    {template.previewUrl ? (
                                        <a
                                            href={template.previewUrl}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                        >
                                            <Eye className="h-3 w-3" />
                                            Live Preview
                                        </a>
                                    ) : (
                                        <button disabled className="flex items-center justify-center gap-2 bg-gray-800 text-gray-500 text-xs font-bold py-2 rounded-lg cursor-not-allowed border border-gray-700">
                                            <EyeOff className="h-3 w-3" />
                                            No Preview
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Upload className="h-6 w-6 text-purple-500" /> Upload New Theme
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Theme Name</label>
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Modern Coastal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the design..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                                        <select
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="free">Free</option>
                                            <option value="premium">Premium</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Thumbnail URL</label>
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                        value={formData.thumbnail}
                                        onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Preview URL (Optional)</label>
                                    <input
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                        value={formData.previewUrl}
                                        onChange={e => setFormData({ ...formData, previewUrl: e.target.value })}
                                        placeholder="https://demo..."
                                    />
                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-2 flex justify-center items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                                    Publish Theme
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
