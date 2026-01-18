"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Layout, Star, Grid, MapPin, Tag, MessageSquare, Eye, EyeOff, Plus, X, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function HomepageSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotels, setHotels] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('hero');

    const [config, setConfig] = useState({
        hero: { title: "", subtitle: "", backgroundImage: "" },
        featured: { title: "", subtitle: "", hotels: [] as string[] },
        categories: { enabled: true, title: "", subtitle: "", items: [] as any[] },
        destinations: { enabled: true, title: "", subtitle: "", items: [] as any[] },
        offers: { enabled: true, title: "", subtitle: "", items: [] as any[] },
        testimonials: { enabled: true, title: "", subtitle: "", items: [] as any[] }
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/site-config').then(res => res.json()),
            fetch('/api/hotels').then(res => res.json())
        ]).then(([configData, hotelsData]) => {
            if (configData.success && configData.config) {
                setConfig({
                    hero: configData.config.hero || { title: "", subtitle: "", backgroundImage: "" },
                    featured: {
                        title: configData.config.featured?.title || "",
                        subtitle: configData.config.featured?.subtitle || "",
                        hotels: configData.config.featured?.hotels || []
                    },
                    categories: configData.config.categories || { enabled: true, title: "", subtitle: "", items: [] },
                    destinations: configData.config.destinations || { enabled: true, title: "", subtitle: "", items: [] },
                    offers: configData.config.offers || { enabled: true, title: "", subtitle: "", items: [] },
                    testimonials: configData.config.testimonials || { enabled: true, title: "", subtitle: "", items: [] }
                });
            }
            if (hotelsData.success) setHotels(hotelsData.hotels);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/site-config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.success) alert('Homepage settings updated successfully!');
            else alert('Failed to update settings');
        } catch (error) {
            console.error(error);
            alert('Error updating settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    const tabs = [
        { id: 'hero', label: 'Hero Section', icon: Layout },
        { id: 'featured', label: 'Featured Hotels', icon: Star },
        { id: 'categories', label: 'Categories', icon: Grid },
        { id: 'destinations', label: 'Destinations', icon: MapPin },
        { id: 'offers', label: 'Offers & Deals', icon: Tag },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold">Homepage Settings</h1>

            {/* Tabs */}
            <div className="bg-white border rounded-xl p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                {activeTab === 'hero' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-4 text-gray-900">Hero Section</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.hero.title}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
                                placeholder="Find your perfect stay"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Subtitle</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.hero.subtitle}
                                onChange={e => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
                                placeholder="Search hundreds of hotels..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Background Image (1920x1080px)</label>
                            <ImageUploader
                                images={config.hero.backgroundImage ? [config.hero.backgroundImage] : []}
                                onChange={(urls) => setConfig({ ...config, hero: { ...config.hero, backgroundImage: urls[0] || "" } })}
                                maxImages={1}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'featured' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-4 text-gray-900">Featured Hotels</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Section Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.featured.title}
                                onChange={e => setConfig({ ...config, featured: { ...config.featured, title: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">Select Hotels to Feature</label>
                            <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                {hotels.map(hotel => (
                                    <label key={hotel._id} className="flex items-start gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={config.featured.hotels.includes(hotel._id)}
                                            onChange={() => {
                                                const current = config.featured.hotels || [];
                                                const newHotels = current.includes(hotel._id)
                                                    ? current.filter(id => id !== hotel._id)
                                                    : [...current, hotel._id];
                                                setConfig({ ...config, featured: { ...config.featured, hotels: newHotels } });
                                            }}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{hotel.name}</div>
                                            <div className="text-xs text-gray-500">{hotel.contact?.address?.city}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Browse by Category</h2>
                            <button
                                onClick={() => setConfig({ ...config, categories: { ...config.categories, enabled: !config.categories.enabled } })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${config.categories.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {config.categories.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {config.categories.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Section Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.categories.title}
                                onChange={e => setConfig({ ...config, categories: { ...config.categories, title: e.target.value } })}
                                placeholder="Section Title"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-900">Categories List</label>
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        categories: {
                                            ...config.categories,
                                            items: [...config.categories.items, { id: Date.now().toString(), name: "", description: "", icon: "Home", color: "bg-blue-500" }]
                                        }
                                    })}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Add Category
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.categories.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-start">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Name</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.name}
                                                    onChange={e => {
                                                        const newItems = [...config.categories.items];
                                                        newItems[index].name = e.target.value;
                                                        setConfig({ ...config, categories: { ...config.categories, items: newItems } });
                                                    }}
                                                    placeholder="Category Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Icon (Lucide Name)</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.icon}
                                                    onChange={e => {
                                                        const newItems = [...config.categories.items];
                                                        newItems[index].icon = e.target.value;
                                                        setConfig({ ...config, categories: { ...config.categories, items: newItems } });
                                                    }}
                                                    placeholder="e.g. Home, Mountain"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Description</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.description}
                                                    onChange={e => {
                                                        const newItems = [...config.categories.items];
                                                        newItems[index].description = e.target.value;
                                                        setConfig({ ...config, categories: { ...config.categories, items: newItems } });
                                                    }}
                                                    placeholder="Description"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newItems = config.categories.items.filter((_, i) => i !== index);
                                                setConfig({ ...config, categories: { ...config.categories, items: newItems } });
                                            }}
                                            className="text-red-500 hover:text-red-700 mt-6"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'destinations' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Popular Destinations</h2>
                            <button
                                onClick={() => setConfig({ ...config, destinations: { ...config.destinations, enabled: !config.destinations.enabled } })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${config.destinations.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {config.destinations.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {config.destinations.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Section Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.destinations.title}
                                onChange={e => setConfig({ ...config, destinations: { ...config.destinations, title: e.target.value } })}
                                placeholder="Section Title"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-900">Destinations List</label>
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        destinations: {
                                            ...config.destinations,
                                            items: [...config.destinations.items, { name: "", image: "", hotelCount: 0, startingPrice: 0 }]
                                        }
                                    })}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Add Destination
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.destinations.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-start">
                                        <div className="h-24 w-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <MapPin className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Destination Name</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.name}
                                                    onChange={e => {
                                                        const newItems = [...config.destinations.items];
                                                        newItems[index].name = e.target.value;
                                                        setConfig({ ...config, destinations: { ...config.destinations, items: newItems } });
                                                    }}
                                                    placeholder="e.g. Cox's Bazar"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Starting Price</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.startingPrice}
                                                    onChange={e => {
                                                        const newItems = [...config.destinations.items];
                                                        newItems[index].startingPrice = Number(e.target.value);
                                                        setConfig({ ...config, destinations: { ...config.destinations, items: newItems } });
                                                    }}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Image URL</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                        value={item.image}
                                                        onChange={e => {
                                                            const newItems = [...config.destinations.items];
                                                            newItems[index].image = e.target.value;
                                                            setConfig({ ...config, destinations: { ...config.destinations, items: newItems } });
                                                        }}
                                                        placeholder="https://..."
                                                    />
                                                    <ImageUploader
                                                        images={[]}
                                                        onChange={(urls) => {
                                                            if (urls[0]) {
                                                                const newItems = [...config.destinations.items];
                                                                newItems[index].image = urls[0];
                                                                setConfig({ ...config, destinations: { ...config.destinations, items: newItems } });
                                                            }
                                                        }}
                                                        maxImages={1}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newItems = config.destinations.items.filter((_, i) => i !== index);
                                                setConfig({ ...config, destinations: { ...config.destinations, items: newItems } });
                                            }}
                                            className="text-red-500 hover:text-red-700 mt-6"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'offers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Exclusive Offers & Deals</h2>
                            <button
                                onClick={() => setConfig({ ...config, offers: { ...config.offers, enabled: !config.offers.enabled } })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${config.offers.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {config.offers.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {config.offers.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Section Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.offers.title}
                                onChange={e => setConfig({ ...config, offers: { ...config.offers, title: e.target.value } })}
                                placeholder="Section Title"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-900">Offers List</label>
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        offers: {
                                            ...config.offers,
                                            items: [...config.offers.items, { title: "", discount: "", description: "", promoCode: "", validUntil: "", image: "" }]
                                        }
                                    })}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Add Offer
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.offers.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-start">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Title</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].title = e.target.value;
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                    placeholder="Offer Title"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Discount</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.discount}
                                                    onChange={e => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].discount = e.target.value;
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                    placeholder="e.g. 30% OFF"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Description</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.description}
                                                    onChange={e => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].description = e.target.value;
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                    placeholder="Description"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Promo Code</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.promoCode}
                                                    onChange={e => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].promoCode = e.target.value;
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                    placeholder="CODE123"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Valid Until</label>
                                                <input
                                                    type="date"
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.validUntil}
                                                    onChange={e => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].validUntil = e.target.value;
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Background Image</label>
                                                <ImageUploader
                                                    images={item.image ? [item.image] : []}
                                                    onChange={(urls) => {
                                                        const newItems = [...config.offers.items];
                                                        newItems[index].image = urls[0] || "";
                                                        setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                                    }}
                                                    maxImages={1}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newItems = config.offers.items.filter((_, i) => i !== index);
                                                setConfig({ ...config, offers: { ...config.offers, items: newItems } });
                                            }}
                                            className="text-red-500 hover:text-red-700 mt-6"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'testimonials' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Customer Testimonials</h2>
                            <button
                                onClick={() => setConfig({ ...config, testimonials: { ...config.testimonials, enabled: !config.testimonials.enabled } })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${config.testimonials.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {config.testimonials.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {config.testimonials.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Section Title</label>
                            <input
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                value={config.testimonials.title}
                                onChange={e => setConfig({ ...config, testimonials: { ...config.testimonials, title: e.target.value } })}
                                placeholder="Section Title"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-900">Testimonials List</label>
                                <button
                                    onClick={() => setConfig({
                                        ...config,
                                        testimonials: {
                                            ...config.testimonials,
                                            items: [...config.testimonials.items, { name: "", location: "", review: "", rating: 5, hotel: "", avatar: "" }]
                                        }
                                    })}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus className="h-4 w-4" /> Add Testimonial
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.testimonials.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 border rounded-lg bg-gray-50 items-start">
                                        <div className="h-16 w-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                    <MessageSquare className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Name</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.name}
                                                    onChange={e => {
                                                        const newItems = [...config.testimonials.items];
                                                        newItems[index].name = e.target.value;
                                                        setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                    }}
                                                    placeholder="Guest Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Location</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.location}
                                                    onChange={e => {
                                                        const newItems = [...config.testimonials.items];
                                                        newItems[index].location = e.target.value;
                                                        setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                    }}
                                                    placeholder="e.g. New York, USA"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Hotel Stayed</label>
                                                <input
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                                                    value={item.hotel}
                                                    onChange={e => {
                                                        const newItems = [...config.testimonials.items];
                                                        newItems[index].hotel = e.target.value;
                                                        setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                    }}
                                                    placeholder="Hotel Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Rating (1-5)</label>
                                                <div className="flex items-center gap-2 p-2 bg-white border rounded">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => {
                                                                const newItems = [...config.testimonials.items];
                                                                newItems[index].rating = star;
                                                                setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                            }}
                                                        >
                                                            <Star className={`h-4 w-4 ${star <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Review</label>
                                                <textarea
                                                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 bg-white h-20"
                                                    value={item.review}
                                                    onChange={e => {
                                                        const newItems = [...config.testimonials.items];
                                                        newItems[index].review = e.target.value;
                                                        setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                    }}
                                                    placeholder="Guest's review..."
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500">Avatar Image</label>
                                                <ImageUploader
                                                    images={item.avatar ? [item.avatar] : []}
                                                    onChange={(urls) => {
                                                        const newItems = [...config.testimonials.items];
                                                        newItems[index].avatar = urls[0] || "";
                                                        setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                                    }}
                                                    maxImages={1}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newItems = config.testimonials.items.filter((_, i) => i !== index);
                                                setConfig({ ...config, testimonials: { ...config.testimonials, items: newItems } });
                                            }}
                                            className="text-red-500 hover:text-red-700 mt-6"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end sticky bottom-6 z-10">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:opacity-70 transition-all border-2 border-white/20"
                >
                    {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
