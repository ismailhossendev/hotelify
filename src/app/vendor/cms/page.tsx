
"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Layout, Info, Phone, Image as ImageIcon, Palette } from "lucide-react";

export default function VendorCMSPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const [config, setConfig] = useState({
        hero: { title: "", subtitle: "", backgroundImage: "" },
        about: { title: "", content: "", image: "" },
        contact: { phone: "", email: "", address: "", googleMapUrl: "" },
        colors: { primary: "#000000", secondary: "#ffffff" },
        socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
        gallery: [] as string[]
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/vendor/cms');
            const data = await res.json();
            if (data.success && data.config) {
                setConfig(prev => ({ ...prev, ...data.config }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/vendor/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.success) {
                alert('Website configuration saved successfully!');
            } else {
                alert('Failed to save configuration');
            }
        } catch (error) {
            alert('Error saving configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-cyan-600" /></div>;

    const tabs = [
        { id: "general", label: "General & Hero", icon: Layout },
        { id: "about", label: "About Us", icon: Info },
        { id: "contact", label: "Contact Info", icon: Phone },
        { id: "styles", label: "Colors & Style", icon: Palette },
        { id: "gallery", label: "Gallery", icon: ImageIcon },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Website Builder</h1>
                    <p className="text-sm text-gray-500">Customize your dedicated hotel website.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    {activeTab === "general" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hero Section Configuration</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Title</label>
                                <input
                                    type="text"
                                    value={config.hero.title}
                                    onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    placeholder="e.g. Welcome to Paradise Resort"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Subtitle</label>
                                <input
                                    type="text"
                                    value={config.hero.subtitle}
                                    onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    placeholder="e.g. Experience luxury like never before"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Image URL</label>
                                <input
                                    type="text"
                                    value={config.hero.backgroundImage}
                                    onChange={e => setConfig({ ...config, hero: { ...config.hero, backgroundImage: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-400 mt-1">Direct link to an image (Unsplash, etc.)</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Section</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                                <input
                                    type="text"
                                    value={config.about.title}
                                    onChange={e => setConfig({ ...config, about: { ...config.about, title: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content / Description</label>
                                <textarea
                                    rows={6}
                                    value={config.about.content}
                                    onChange={e => setConfig({ ...config, about: { ...config.about, content: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    placeholder="Tell your guests about your hotel's story and mission..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "contact" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={config.contact.phone}
                                        onChange={e => setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <input
                                        type="text"
                                        value={config.contact.email}
                                        onChange={e => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
                                <input
                                    type="text"
                                    value={config.contact.address}
                                    onChange={e => setConfig({ ...config, contact: { ...config.contact, address: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Maps Embed URL</label>
                                <input
                                    type="text"
                                    value={config.contact.googleMapUrl}
                                    onChange={e => setConfig({ ...config, contact: { ...config.contact, googleMapUrl: e.target.value } })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                    placeholder='<iframe src="..."></iframe> or URL'
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <h4 className="text-sm font-semibold mb-3">Social Media Links</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Facebook URL"
                                        value={config.socialLinks.facebook}
                                        onChange={e => setConfig({ ...config, socialLinks: { ...config.socialLinks, facebook: e.target.value } })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Instagram URL"
                                        value={config.socialLinks.instagram}
                                        onChange={e => setConfig({ ...config, socialLinks: { ...config.socialLinks, instagram: e.target.value } })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "styles" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding & Colors</h3>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={config.colors.primary}
                                            onChange={e => setConfig({ ...config, colors: { ...config.colors, primary: e.target.value } })}
                                            className="h-10 w-20 rounded cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-gray-500">{config.colors.primary}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Used for buttons, links, and highlights.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={config.colors.secondary}
                                            onChange={e => setConfig({ ...config, colors: { ...config.colors, secondary: e.target.value } })}
                                            className="h-10 w-20 rounded cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-gray-500">{config.colors.secondary}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Used for backgrounds and accents.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "gallery" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Image Gallery</h3>
                            <p className="text-sm text-gray-400 mb-4">Add image URLs to display in your website's gallery section.</p>

                            {config.gallery.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={e => {
                                            const newGallery = [...config.gallery];
                                            newGallery[index] = e.target.value;
                                            setConfig({ ...config, gallery: newGallery });
                                        }}
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 py-2"
                                        placeholder="Image URL"
                                    />
                                    <button
                                        onClick={() => {
                                            const newGallery = config.gallery.filter((_, i) => i !== index);
                                            setConfig({ ...config, gallery: newGallery });
                                        }}
                                        className="text-red-500 hover:text-red-400 px-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => setConfig({ ...config, gallery: [...config.gallery, ""] })}
                                className="text-sm text-cyan-500 hover:text-cyan-400 font-medium"
                            >
                                + Add Image URL
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
