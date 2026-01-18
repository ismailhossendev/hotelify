
import Link from "next/link";
import { Building, ArrowRight, CheckCircle, Globe, ShoppingCart, Shield } from "lucide-react";
import dbConnect from "@/lib/db/connect";
import { SystemConfig } from "@/lib/db/models/SystemConfig";

async function getLandingContent() {
    await dbConnect();
    const config = await SystemConfig.findOne({ key: 'landing_page_content' });

    // Default Bangla Content (Kuakata Focus)
    const defaults = {
        hero: {
            title: "কুয়াকাটার সেরা হোটেল ম্যানেজমেন্ট সফটওয়্যার",
            subtitle: "সহজ, দ্রুত এবং আধুনিক। আপনার হোটেলের বুকিং, রেস্টুরেন্ট এবং হিসাব নিকাশ এখন হাতের মুঠোয়।",
            ctaText: "বিনামূল্যে শুরু করুন",
            imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=2062&auto=format&fit=crop" // Kuakata vibe
        },
        features: [
            { title: "সহজ বুকিং", description: "অনলাইন এবং অফলাইন বুকিং ম্যানেজমেন্ট" },
            { title: "রিয়েল-টাইম হিসাব", description: "প্রতিদিনের আয়-ব্যয়ের সঠিক হিসাব" },
            { title: "রেস্টুরেন্ট ও POS", description: "খাবার অর্ডার এবং বিলিং সিস্টেম" }
        ],
        about: {
            title: "আমাদের সম্পর্কে",
            content: "আমরা কুয়াকাটার পর্যটন শিল্পকে ডিজিটাল করার লক্ষ্যে কাজ করছি..."
        }
    };

    return config ? { ...defaults, ...config.value } : defaults;
}

export default async function JoinUsPage() {
    const content = await getLandingContent();

    return (
        <div className="min-h-screen bg-white font-mina">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md fixed w-full z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Building className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-blue-900 tracking-tight">হোটেলিফাই</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-blue-900 font-semibold hover:text-blue-700">
                            পার্টনার লগইন
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-200"
                        >
                            রেজিস্ট্রেশন
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-2/3 h-full bg-blue-50/50 rounded-bl-[100px]" />

                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                            </span>
                            হোটেল মালিকদের জন্য 🇧🇩
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                            {content.hero.title}
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            {content.hero.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/register" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                                {content.hero.ctaText} <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                        <div className="pt-8 flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" /> ১ মাস ফ্রি ট্রায়াল
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" /> ফ্রি সেটআপ
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                        <img
                            src={content.hero.imageUrl || "/hero-hotel.jpg"}
                            alt="Hotel Management"
                            className="relative rounded-2xl shadow-2xl border-4 border-white w-full object-cover h-[500px]"
                        />
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">কেন আমাদের সাথে কাজ করবেন?</h2>
                        <p className="text-gray-500 text-lg">আধুনিক প্রযুক্তির ছোঁয়ায় আপনার হোটেল পরিচালনা করুন আরও সহজে</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {content.features.map((feature: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 hover:bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all group">
                                <div className="h-14 w-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Globe className="h-7 w-7 text-blue-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
