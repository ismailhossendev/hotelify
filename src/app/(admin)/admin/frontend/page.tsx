"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Layout, Type, Image as ImageIcon, Plus, Trash, Link as LinkIcon, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin, MapPin, Tag, MessageSquare, Building, Star } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function AdminFrontendPage() {
    const [activeTab, setActiveTab] = useState("hero");
    const [content, setContent] = useState<any>({
        hero: {
            title: "Find your perfect stay",
            subtitle: "Search hundreds of hotels, resorts, and vacation rentals for your next trip.",
            backgroundImage: ""
        },
        features: [],
        about: { title: "", content: "" },
        header: {
            contact: { phone: "+880 1700-000000", email: "info@hotelify.com" },
            navigation: []
        },
        footer: {
            description: "Discover and book the best hotels across Bangladesh.",
            socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
            copyrightText: "© 2024 Hotelify. All rights reserved."
        },
        featured: {
            title: "Trending Destinations",
            subtitle: "Most popular choices for travelers from Bangladesh",
            hotelIds: []
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availableHotels, setAvailableHotels] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, hotelsRes] = await Promise.all([
                    fetch('/api/admin/frontend'),
                    fetch('/api/admin/hotels?limit=100')
                ]);

                const configData = await configRes.json();
                const hotelsData = await hotelsRes.json();

                if (configData.success && configData.content) {
                    setContent((prev: any) => ({ ...prev, ...configData.content }));
                }

                if (hotelsData.success && hotelsData.hotels) {
                    setAvailableHotels(hotelsData.hotels);
                }
            } catch (error) {
                console.error("Failed to load admin data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/frontend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            const data = await res.json();
            if (data.success) {
                alert('Frontend content updated!');
            } else {
                alert('Failed to update: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Error saving content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    const tabs = [
        { id: "hero", label: "Hero & Landing", icon: Layout },
        { id: "featured", label: "Featured Hotels", icon: Building },
        { id: "categories", label: "Categories", icon: Tag },
        { id: "header", label: "Header", icon: Layout },
        { id: "footer", label: "Footer", icon: Globe },
        { id: "destinations", label: "Destinations", icon: MapPin },
        { id: "offers", label: "Offers", icon: Tag },
        { id: "testimonials", label: "Testimonials", icon: MessageSquare },
        { id: "features", label: "Features", icon: Type },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Frontend Manager</h1>
                    <p className="text-gray-400">Customize global site content</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Publish Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-gray-700 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-t-lg flex items-center gap-2 font-medium transition-colors ${activeTab === tab.id
                            ? "bg-gray-800 text-purple-400 border-t border-x border-gray-700"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-gray-800 rounded-b-xl border border-gray-700 p-6 min-h-[400px]">

                {/* HERO TAB */}
                {activeTab === "hero" && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-700 pb-2 text-white">
                            Landing Page Hero
                        </h2>
                        <InputGroup
                            label="Headline"
                            value={content.hero?.title}
                            onChange={v => setContent({ ...content, hero: { ...content.hero, title: v } })}
                        />
                        <InputGroup
                            label="Subtitle"
                            value={content.hero?.subtitle}
                            onChange={v => setContent({ ...content, hero: { ...content.hero, subtitle: v } })}
                            type="textarea"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Background Image</label>
                            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                <ImageUploader
                                    images={content.hero?.backgroundImage ? [content.hero.backgroundImage] : []}
                                    onChange={(imgs) => setContent({ ...content, hero: { ...content.hero, backgroundImage: imgs[0] || "" } })}
                                    maxImages={1}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px</p>
                        </div>
                    </div>
                )}

                {/* FEATURED HOTELS TAB */}
                {activeTab === "featured" && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-700 pb-2">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building className="h-5 w-5" /> Featured Hotels Section
                            </h2>
                            <p className="text-sm text-gray-400">Select which hotels appear in the "Trending Destinations" section on the homepage</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup
                                label="Section Title"
                                value={content.featured?.title || "Trending Destinations"}
                                onChange={(v: string) => setContent({ ...content, featured: { ...content.featured, title: v } })}
                            />
                            <InputGroup
                                label="Section Subtitle"
                                value={content.featured?.subtitle || ""}
                                onChange={(v: string) => setContent({ ...content, featured: { ...content.featured, subtitle: v } })}
                            />
                        </div>

                        {/* Hotel Selector */}
                        <div className="mt-6">
                            <h3 className="text-md font-bold text-white mb-4">Select Hotels to Feature</h3>

                            {/* Selected Hotels */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-400 mb-2">Currently Featured ({(content.featured?.hotelIds || []).length} hotels)</p>
                                <div className="space-y-2">
                                    {(content.featured?.hotelIds || []).length === 0 ? (
                                        <div className="text-gray-500 text-sm p-4 bg-gray-900 rounded-lg border border-dashed border-gray-700 text-center">
                                            No hotels selected. Choose from the list below.
                                        </div>
                                    ) : (
                                        (content.featured?.hotelIds || []).map((hotelId: string, idx: number) => {
                                            const hotel = availableHotels.find((h: any) => h._id === hotelId);
                                            return (
                                                <div key={hotelId} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-purple-400 font-bold">#{idx + 1}</span>
                                                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                                                        <span className="text-white font-medium">{hotel?.name || 'Unknown Hotel'}</span>
                                                        {hotel?.contact?.address?.city && (
                                                            <span className="text-gray-400 text-sm">• {hotel.contact.address.city}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newIds = (content.featured?.hotelIds || []).filter((id: string) => id !== hotelId);
                                                            setContent({ ...content, featured: { ...content.featured, hotelIds: newIds } });
                                                        }}
                                                        className="text-red-400 hover:text-red-300 p-1"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Available Hotels to Add */}
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Available Hotels (click to add)</p>
                                <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-900 p-3 rounded-lg border border-gray-700">
                                    {availableHotels
                                        .filter((hotel: any) => !(content.featured?.hotelIds || []).includes(hotel._id))
                                        .map((hotel: any) => (
                                            <button
                                                key={hotel._id}
                                                onClick={() => {
                                                    const newIds = [...(content.featured?.hotelIds || []), hotel._id];
                                                    setContent({ ...content, featured: { ...content.featured, hotelIds: newIds } });
                                                }}
                                                className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-800 text-left transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Plus className="h-4 w-4 text-green-400" />
                                                    <span className="text-white">{hotel.name}</span>
                                                    {hotel.contact?.address?.city && (
                                                        <span className="text-gray-500 text-sm">• {hotel.contact.address.city}</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${hotel.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                                                    {hotel.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </button>
                                        ))}
                                    {availableHotels.filter((hotel: any) => !(content.featured?.hotelIds || []).includes(hotel._id)).length === 0 && (
                                        <div className="text-center text-gray-500 py-4">All hotels have been added</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HEADER TAB */}
                {activeTab === "header" && (
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="border-b border-gray-700 pb-2 mb-4">
                                <h2 className="text-lg font-bold text-white">Contact Information</h2>
                                <p className="text-sm text-gray-400">Displayed in the top bar of the website</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    label="Support Phone"
                                    icon={<Phone className="h-4 w-4" />}
                                    value={content.header?.contact?.phone}
                                    onChange={v => setContent({ ...content, header: { ...content.header, contact: { ...content.header?.contact, phone: v } } })}
                                />
                                <InputGroup
                                    label="Support Email"
                                    icon={<Mail className="h-4 w-4" />}
                                    value={content.header?.contact?.email}
                                    onChange={v => setContent({ ...content, header: { ...content.header, contact: { ...content.header?.contact, email: v } } })}
                                />
                            </div>
                        </div>

                        {/* Header Navigation */}
                        <div>
                            <div className="flex justify-between items-center mb-4 border-t border-gray-700 pt-6">
                                <div>
                                    <h3 className="text-md font-bold text-white">Navigation Menu</h3>
                                    <p className="text-xs text-gray-500">Main header links</p>
                                </div>
                                <button
                                    onClick={() => setContent({ ...content, header: { ...content.header, navigation: [...(content.header?.navigation || []), { label: "New Link", href: "/" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Link
                                </button>
                            </div>
                            <div className="space-y-3">
                                {content.header?.navigation?.map((nav: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-700">
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-white px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm"
                                            value={nav.label}
                                            onChange={e => {
                                                const newNav = [...content.header.navigation];
                                                newNav[idx] = { ...newNav[idx], label: e.target.value };
                                                setContent({ ...content, header: { ...content.header, navigation: newNav } });
                                            }}
                                            placeholder="Label"
                                        />
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-gray-400 px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm font-mono"
                                            value={nav.href}
                                            onChange={e => {
                                                const newNav = [...content.header.navigation];
                                                newNav[idx] = { ...newNav[idx], href: e.target.value };
                                                setContent({ ...content, header: { ...content.header, navigation: newNav } });
                                            }}
                                            placeholder="URL Path"
                                        />
                                        <button
                                            onClick={() => {
                                                const newNav = content.header.navigation.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, header: { ...content.header, navigation: newNav } });
                                            }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!content.header?.navigation || content.header.navigation.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No navigation links added.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Bar Navigation */}
                        <div>
                            <div className="flex justify-between items-center mb-4 border-t border-gray-700 pt-6">
                                <div>
                                    <h3 className="text-md font-bold text-white">Top Bar Links</h3>
                                    <p className="text-xs text-gray-500">Secondary links (e.g. List Property, Help)</p>
                                </div>
                                <button
                                    onClick={() => setContent({ ...content, header: { ...content.header, topBarLinks: [...(content.header?.topBarLinks || []), { label: "New Link", href: "/" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Link
                                </button>
                            </div>
                            <div className="space-y-3">
                                {content.header?.topBarLinks?.map((nav: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-700">
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-white px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm"
                                            value={nav.label}
                                            onChange={e => {
                                                const newNav = [...content.header.topBarLinks];
                                                newNav[idx] = { ...newNav[idx], label: e.target.value };
                                                setContent({ ...content, header: { ...content.header, topBarLinks: newNav } });
                                            }}
                                            placeholder="Label"
                                        />
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-gray-400 px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm font-mono"
                                            value={nav.href}
                                            onChange={e => {
                                                const newNav = [...content.header.topBarLinks];
                                                newNav[idx] = { ...newNav[idx], href: e.target.value };
                                                setContent({ ...content, header: { ...content.header, topBarLinks: newNav } });
                                            }}
                                            placeholder="URL Path"
                                        />
                                        <button
                                            onClick={() => {
                                                const newNav = content.header.topBarLinks.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, header: { ...content.header, topBarLinks: newNav } });
                                            }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!content.header?.topBarLinks || content.header.topBarLinks.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No top bar links added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DESTINATIONS TAB */}
                {activeTab === "destinations" && (
                    <div className="space-y-6">
                        <div className="border-b border-gray-700 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white">Popular Destinations Section</h2>
                            <p className="text-sm text-gray-400">Manage the homepage section title. To add/edit actual destination locations, use the Destinations Manager.</p>
                        </div>
                        <InputGroup
                            label="Section Title"
                            value={content.destinations?.title}
                            onChange={v => setContent({ ...content, destinations: { ...content.destinations, title: v } })}
                        />
                        <InputGroup
                            label="Section Subtitle"
                            value={content.destinations?.subtitle}
                            onChange={v => setContent({ ...content, destinations: { ...content.destinations, subtitle: v } })}
                        />

                        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-lg p-6 flex flex-col items-center text-center">
                            <MapPin className="h-12 w-12 text-blue-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Manage Destinations</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Because destinations are complex entities (locations, images, hotels linked), they are managed in a dedicated section.
                            </p>
                            <a
                                href="/admin/destinations"
                                target="_blank"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                            >
                                Go to Destinations Manager
                            </a>
                        </div>
                    </div>
                )}

                {/* OFFERS TAB */}
                {activeTab === "offers" && (
                    <div className="space-y-8">
                        {/* Section Config */}
                        <div className="space-y-4 border-b border-gray-700 pb-6">
                            <h2 className="text-lg font-bold text-white">Offers Section Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Title"
                                    value={content.offers?.title}
                                    onChange={v => setContent({ ...content, offers: { ...content.offers, title: v } })}
                                />
                                <InputGroup
                                    label="Subtitle"
                                    value={content.offers?.subtitle}
                                    onChange={v => setContent({ ...content, offers: { ...content.offers, subtitle: v } })}
                                />
                            </div>
                        </div>

                        {/* Offers List */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-bold text-white">Active Offers</h3>
                                <button
                                    onClick={() => setContent({ ...content, offers: { ...content.offers, items: [...(content.offers?.items || []), { title: "New Offer", discount: "10% OFF", description: "Special deal", promoCode: "SAVE10", validUntil: "2025-12-31" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Offer
                                </button>
                            </div>

                            <div className="space-y-4">
                                {content.offers?.items?.map((offer: any, idx: number) => (
                                    <div key={idx} className="bg-gray-750 p-4 rounded-lg flex flex-col gap-4 border border-gray-700 relative group">
                                        <button
                                            onClick={() => {
                                                const newItems = content.offers.items.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup
                                                label="Offer Title"
                                                value={offer.title}
                                                onChange={v => {
                                                    const newItems = [...content.offers.items];
                                                    newItems[idx] = { ...newItems[idx], title: v };
                                                    setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Discount Text"
                                                value={offer.discount}
                                                onChange={v => {
                                                    const newItems = [...content.offers.items];
                                                    newItems[idx] = { ...newItems[idx], discount: v };
                                                    setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Promo Code"
                                                value={offer.promoCode}
                                                onChange={v => {
                                                    const newItems = [...content.offers.items];
                                                    newItems[idx] = { ...newItems[idx], promoCode: v };
                                                    setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Valid Until"
                                                type="date"
                                                value={offer.validUntil}
                                                onChange={v => {
                                                    const newItems = [...content.offers.items];
                                                    newItems[idx] = { ...newItems[idx], validUntil: v };
                                                    setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                                }}
                                            />
                                            <div className="md:col-span-2">
                                                <InputGroup
                                                    label="Description"
                                                    value={offer.description}
                                                    onChange={v => {
                                                        const newItems = [...content.offers.items];
                                                        newItems[idx] = { ...newItems[idx], description: v };
                                                        setContent({ ...content, offers: { ...content.offers, items: newItems } });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TESTIMONIALS TAB */}
                {activeTab === "testimonials" && (
                    <div className="space-y-8">
                        {/* Section Config */}
                        <div className="space-y-4 border-b border-gray-700 pb-6">
                            <h2 className="text-lg font-bold text-white">Testimonials Section</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Title"
                                    value={content.testimonials?.title}
                                    onChange={v => setContent({ ...content, testimonials: { ...content.testimonials, title: v } })}
                                />
                                <InputGroup
                                    label="Subtitle"
                                    value={content.testimonials?.subtitle}
                                    onChange={v => setContent({ ...content, testimonials: { ...content.testimonials, subtitle: v } })}
                                />
                            </div>
                        </div>

                        {/* Testimonials List */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-bold text-white">Client Reviews</h3>
                                <button
                                    onClick={() => setContent({ ...content, testimonials: { ...content.testimonials, items: [...(content.testimonials?.items || []), { name: "John Doe", location: "Dhaka", rating: 5, review: "Great service!" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Review
                                </button>
                            </div>

                            <div className="space-y-4">
                                {content.testimonials?.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-gray-750 p-4 rounded-lg flex flex-col gap-4 border border-gray-700 relative group">
                                        <button
                                            onClick={() => {
                                                const newItems = content.testimonials.items.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputGroup
                                                label="Guest Name"
                                                value={item.name}
                                                onChange={v => {
                                                    const newItems = [...content.testimonials.items];
                                                    newItems[idx] = { ...newItems[idx], name: v };
                                                    setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Location"
                                                value={item.location}
                                                onChange={v => {
                                                    const newItems = [...content.testimonials.items];
                                                    newItems[idx] = { ...newItems[idx], location: v };
                                                    setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Rating (1-5)"
                                                type="number"
                                                value={item.rating}
                                                onChange={v => {
                                                    const newItems = [...content.testimonials.items];
                                                    newItems[idx] = { ...newItems[idx], rating: parseInt(v) || 5 };
                                                    setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                                }}
                                            />
                                            <div className="md:col-span-2">
                                                <InputGroup
                                                    label="Review Text"
                                                    value={item.review}
                                                    onChange={v => {
                                                        const newItems = [...content.testimonials.items];
                                                        newItems[idx] = { ...newItems[idx], review: v };
                                                        setContent({ ...content, testimonials: { ...content.testimonials, items: newItems } });
                                                    }}
                                                    type="textarea"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER TAB */}
                {activeTab === "footer" && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">General Info</h2>
                            <InputGroup
                                label="Footer Description"
                                value={content.footer?.description}
                                onChange={v => setContent({ ...content, footer: { ...content.footer, description: v } })}
                                type="textarea"
                            />
                            <div className="mt-4">
                                <InputGroup
                                    label="Copyright Text"
                                    value={content.footer?.copyrightText}
                                    onChange={v => setContent({ ...content, footer: { ...content.footer, copyrightText: v } })}
                                />
                            </div>
                        </div>

                        {/* Footer Quick Links */}
                        <div>
                            <div className="flex justify-between items-center mb-4 border-t border-gray-700 pt-6">
                                <div>
                                    <h3 className="text-md font-bold text-white">Quick Links</h3>
                                </div>
                                <button
                                    onClick={() => setContent({ ...content, footer: { ...content.footer, quickLinks: [...(content.footer?.quickLinks || []), { label: "New Link", href: "/" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Link
                                </button>
                            </div>
                            <div className="space-y-2">
                                {content.footer?.quickLinks?.map((link: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-700">
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-white px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm"
                                            value={link.label}
                                            onChange={e => {
                                                const newLinks = [...content.footer.quickLinks];
                                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                setContent({ ...content, footer: { ...content.footer, quickLinks: newLinks } });
                                            }}
                                            placeholder="Label"
                                        />
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-gray-400 px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm font-mono"
                                            value={link.href}
                                            onChange={e => {
                                                const newLinks = [...content.footer.quickLinks];
                                                newLinks[idx] = { ...newLinks[idx], href: e.target.value };
                                                setContent({ ...content, footer: { ...content.footer, quickLinks: newLinks } });
                                            }}
                                            placeholder="URL"
                                        />
                                        <button
                                            onClick={() => {
                                                const newLinks = content.footer.quickLinks.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, footer: { ...content.footer, quickLinks: newLinks } });
                                            }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!content.footer?.quickLinks || content.footer.quickLinks.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No quick links added.</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Support Links */}
                        <div>
                            <div className="flex justify-between items-center mb-4 border-t border-gray-700 pt-6">
                                <div>
                                    <h3 className="text-md font-bold text-white">Support Links</h3>
                                </div>
                                <button
                                    onClick={() => setContent({ ...content, footer: { ...content.footer, supportLinks: [...(content.footer?.supportLinks || []), { label: "New Link", href: "/" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Link
                                </button>
                            </div>
                            <div className="space-y-2">
                                {content.footer?.supportLinks?.map((link: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-700">
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-white px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm"
                                            value={link.label}
                                            onChange={e => {
                                                const newLinks = [...content.footer.supportLinks];
                                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                setContent({ ...content, footer: { ...content.footer, supportLinks: newLinks } });
                                            }}
                                            placeholder="Label"
                                        />
                                        <input
                                            className="bg-transparent border-b border-gray-700 text-gray-400 px-2 py-1 flex-1 focus:border-purple-500 outline-none text-sm font-mono"
                                            value={link.href}
                                            onChange={e => {
                                                const newLinks = [...content.footer.supportLinks];
                                                newLinks[idx] = { ...newLinks[idx], href: e.target.value };
                                                setContent({ ...content, footer: { ...content.footer, supportLinks: newLinks } });
                                            }}
                                            placeholder="URL"
                                        />
                                        <button
                                            onClick={() => {
                                                const newLinks = content.footer.supportLinks.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, footer: { ...content.footer, supportLinks: newLinks } });
                                            }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!content.footer?.supportLinks || content.footer.supportLinks.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No support links added.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-700">
                            <h2 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4">Social Media Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="Facebook"
                                    icon={<Facebook className="h-4 w-4" />}
                                    value={content.footer?.socialLinks?.facebook}
                                    onChange={v => setContent({ ...content, footer: { ...content.footer, socialLinks: { ...content.footer?.socialLinks, facebook: v } } })}
                                />
                                <InputGroup
                                    label="Twitter (X)"
                                    icon={<Twitter className="h-4 w-4" />}
                                    value={content.footer?.socialLinks?.twitter}
                                    onChange={v => setContent({ ...content, footer: { ...content.footer, socialLinks: { ...content.footer?.socialLinks, twitter: v } } })}
                                />
                                <InputGroup
                                    label="Instagram"
                                    icon={<Instagram className="h-4 w-4" />}
                                    value={content.footer?.socialLinks?.instagram}
                                    onChange={v => setContent({ ...content, footer: { ...content.footer, socialLinks: { ...content.footer?.socialLinks, instagram: v } } })}
                                />
                                <InputGroup
                                    label="LinkedIn"
                                    icon={<Linkedin className="h-4 w-4" />}
                                    value={content.footer?.socialLinks?.linkedin}
                                    onChange={v => setContent({ ...content, footer: { ...content.footer, socialLinks: { ...content.footer?.socialLinks, linkedin: v } } })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* FEATURES TAB */}
                {activeTab === "features" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-700 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white">Features / Value Props</h2>
                            <p className="text-sm text-gray-400">Highlight key amenities or benefits (e.g. "Secure Booking").</p>
                        </div>

                        {/* No Section Title/Subtitle supported in current Schema for features array */}

                        <div>
                            <div className="flex justify-between items-center mb-4 mt-8">
                                <h3 className="text-md font-bold text-white">Features List</h3>
                                <button
                                    onClick={() => setContent({ ...content, features: [...(content.features || []), { title: "New Feature", description: "Description", icon: "Star" }] })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Feature
                                </button>
                            </div>

                            <div className="space-y-4">
                                {Array.isArray(content.features) && content.features.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-gray-750 p-4 rounded-lg flex flex-col gap-4 border border-gray-700 relative group">
                                        <button
                                            onClick={() => {
                                                const newItems = content.features.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, features: newItems });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputGroup
                                                label="Title"
                                                value={item.title}
                                                onChange={(v: string) => {
                                                    const newItems = [...content.features];
                                                    newItems[idx] = { ...newItems[idx], title: v };
                                                    setContent({ ...content, features: newItems });
                                                }}
                                            />
                                            <InputGroup
                                                label="Icon (Lucide Name)"
                                                value={item.icon}
                                                onChange={(v: string) => {
                                                    const newItems = [...content.features];
                                                    newItems[idx] = { ...newItems[idx], icon: v };
                                                    setContent({ ...content, features: newItems });
                                                }}
                                                placeholder="e.g. Wifi, Shield, Star"
                                            />
                                            <InputGroup
                                                label="Description"
                                                value={item.description}
                                                onChange={(v: string) => {
                                                    const newItems = [...content.features];
                                                    newItems[idx] = { ...newItems[idx], description: v };
                                                    setContent({ ...content, features: newItems });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!content.features || content.features.length === 0) && (
                                    <p className="text-gray-500 text-sm italic">No features added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FEATURED/TRENDING TAB */}
                {activeTab === "featured" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-700 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white">Featured Hotels Section</h2>
                            <p className="text-sm text-gray-400">Select which properties to highlight on the homepage.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup
                                label="Section Title"
                                value={content.featured?.title}
                                onChange={v => setContent({ ...content, featured: { ...content.featured, title: v } })}
                            />
                            <InputGroup
                                label="Section Subtitle"
                                value={content.featured?.subtitle}
                                onChange={v => setContent({ ...content, featured: { ...content.featured, subtitle: v } })}
                            />
                        </div>

                        <div className="mt-8">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Selected Hotels</label>
                            {/* Simple pill-based selector or list */}
                            <div className="space-y-2">
                                {(content.featured?.hotels || []).map((hotelId: string | any, idx: number) => {
                                    // Handle if it's populated object or ID string
                                    const currentId = typeof hotelId === 'object' ? hotelId._id : hotelId;

                                    return (
                                        <div key={idx} className="flex gap-2">
                                            <select
                                                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                                                value={currentId}
                                                onChange={(e) => {
                                                    const newHotels = [...(content.featured?.hotels || [])];
                                                    newHotels[idx] = e.target.value;
                                                    setContent({ ...content, featured: { ...content.featured, hotels: newHotels } });
                                                }}
                                            >
                                                <option value="">Select a Hotel...</option>
                                                {availableHotels.map((h: any) => (
                                                    <option key={h._id} value={h._id}>{h.name} ({h.city})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const newHotels = (content.featured?.hotels || []).filter((_: any, i: number) => i !== idx);
                                                    setContent({ ...content, featured: { ...content.featured, hotels: newHotels } });
                                                }}
                                                className="p-2 text-red-400 hover:bg-red-900/30 rounded"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )
                                })}

                                <button
                                    onClick={() => setContent({ ...content, featured: { ...content.featured, hotels: [...(content.featured?.hotels || []), ""] } })}
                                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-2"
                                >
                                    <Plus className="h-3 w-3" /> Add Hotel Slot
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === "categories" && (
                    <div className="space-y-8">
                        <div className="border-b border-gray-700 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white">Categories Section</h2>
                            <p className="text-sm text-gray-400">Manage property type categories.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup
                                label="Section Title"
                                value={content.categories?.title}
                                onChange={v => setContent({ ...content, categories: { ...content.categories, title: v } })}
                            />
                            <InputGroup
                                label="Section Subtitle"
                                value={content.categories?.subtitle}
                                onChange={v => setContent({ ...content, categories: { ...content.categories, subtitle: v } })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4 mt-8">
                                <h3 className="text-md font-bold text-white">Categories List</h3>
                                <button
                                    onClick={() => setContent({ ...content, categories: { ...content.categories, items: [...(content.categories?.items || []), { name: "New Category", icon: "Home", description: "Desc", color: "bg-blue-500" }] } })}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Add Category
                                </button>
                            </div>

                            <div className="space-y-4">
                                {content.categories?.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-gray-750 p-4 rounded-lg flex flex-col gap-4 border border-gray-700 relative group">
                                        <button
                                            onClick={() => {
                                                const newItems = content.categories.items.filter((_: any, i: number) => i !== idx);
                                                setContent({ ...content, categories: { ...content.categories, items: newItems } });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputGroup
                                                label="Name"
                                                value={item.name}
                                                onChange={v => {
                                                    const newItems = [...content.categories.items];
                                                    newItems[idx] = { ...newItems[idx], name: v };
                                                    setContent({ ...content, categories: { ...content.categories, items: newItems } });
                                                }}
                                            />
                                            <InputGroup
                                                label="Icon (Lucide Name)"
                                                value={item.icon}
                                                onChange={v => {
                                                    const newItems = [...content.categories.items];
                                                    newItems[idx] = { ...newItems[idx], icon: v };
                                                    setContent({ ...content, categories: { ...content.categories, items: newItems } });
                                                }}
                                                placeholder="e.g. Home, Building, Tent"
                                            />
                                            <InputGroup
                                                label="Color Class"
                                                value={item.color}
                                                onChange={v => {
                                                    const newItems = [...content.categories.items];
                                                    newItems[idx] = { ...newItems[idx], color: v };
                                                    setContent({ ...content, categories: { ...content.categories, items: newItems } });
                                                }}
                                                placeholder="bg-blue-500"
                                            />
                                            <div className="md:col-span-3">
                                                <InputGroup
                                                    label="Description"
                                                    value={item.description}
                                                    onChange={v => {
                                                        const newItems = [...content.categories.items];
                                                        newItems[idx] = { ...newItems[idx], description: v };
                                                        setContent({ ...content, categories: { ...content.categories, items: newItems } });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface InputGroupProps {
    label: string;
    value: any;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    rows?: number;
    icon?: React.ReactNode;
}

function InputGroup({ label, value, onChange, type = "text", placeholder = "", rows = 3, icon }: InputGroupProps) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                {icon && <span className="text-purple-400">{icon}</span>}
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
                    rows={rows}
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type={type}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}
