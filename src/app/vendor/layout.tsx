import { getCurrentUser } from "@/lib/auth/token";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Hotel,
    LayoutDashboard,
    BedDouble,
    CalendarDays,
    ShoppingCart,
    Settings,
    LogOut,
    Brush,
    Shield,
    Ban,
    Tag
} from "lucide-react";
import ImpersonationBanner from "@/components/ImpersonationBanner";

export default async function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Basic role check
    if (!user.role.includes("vendor") && user.role !== "super_admin") {
        redirect("/");
    }

    // Check if user has completed onboarding (has a hotel assigned)
    const hasCompletedOnboarding = !!user.hotelId || user.role === "super_admin";

    // SUSPENSION CHECK
    if (user.hotelId) {
        // Need to fetch hotel status
        // Since this is a server component, we can fetch directly if we import db
        // But Layouts are tricky with async db calls if not careful with connection
        // Better to use an API fetch or a direct db call if `dbConnect` is safe here.
        // Given existing pattern uses `getCurrentUser` which likely uses DB, we can use DB here.

        // However, importing Hotel model here might break if not handled well in Next.js app dir layouts
        // Let's use a safe fetch approach or direct model if imports allow.
        // Checking imports... `getCurrentUser` is from lib/auth/token.
        // Let's rely on a fetch to the internal API for safety/consistency or direct DB.
        // Direct DB is faster for layout.

        const { Hotel } = await import("@/lib/db/models/Hotel");
        const { default: dbConnect } = await import("@/lib/db/connect");
        await dbConnect();

        const hotel = await Hotel.findById(user.hotelId).select('isActive');
        if (hotel && !hotel.isActive) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <Ban className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Account Suspended</h1>
                        <p className="text-gray-500">
                            Your vendor account has been suspended by the administrator.
                            You cannot access the dashboard at this time.
                        </p>
                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-400 mb-2">Need help?</p>
                            <Link href="/support" className="text-blue-600 font-medium hover:underline">
                                Contact Support
                            </Link>
                        </div>
                        <div className="pt-2">
                            <Link href="/api/auth/logout" className="text-sm text-red-500 hover:underline">
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
    }

    const navItems = [
        { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
        { label: "Bookings", href: "/vendor/bookings", icon: CalendarDays },
        { label: "Rooms", href: "/vendor/rooms", icon: BedDouble },
        { label: "Offers", href: "/vendor/offers", icon: Tag },
        { label: "POS & Orders", href: "/vendor/pos", icon: ShoppingCart },
        { label: "Housekeeping", href: "/vendor/housekeeping", icon: Brush },
        { label: "Settings", href: "/vendor/settings", icon: Settings },
        { label: "Support", href: "/vendor/support", icon: Shield },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="w-8 h-8 relative">
                        <img src="/logo.png" alt="Hotelify" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Hotelify</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={hasCompletedOnboarding ? item.href : "#"}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                ${hasCompletedOnboarding
                                    ? 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                    : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user.role[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Vendor Admin</p>
                            <Link href="/api/auth/logout" className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                <LogOut className="h-3 w-3" /> Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 p-8 relative">
                {/* Impersonation Banner - Only shows when Super Admin is impersonating */}
                <ImpersonationBanner isImpersonating={!!user.impersonatedBy} />

                {/* Onboarding Overlay - Show if user hasn't completed onboarding */}
                {!hasCompletedOnboarding && (
                    <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Hotel className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Setup</h2>
                            <p className="text-gray-500 mb-6">
                                You need to create your hotel profile before you can access the dashboard features.
                            </p>
                            <Link
                                href="/onboarding"
                                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Create Your Hotel
                            </Link>
                        </div>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
