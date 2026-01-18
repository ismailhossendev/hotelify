import { getCurrentUser } from "@/lib/auth/token";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Building, Users, CreditCard, Settings, LogOut, TrendingUp, Globe, Layout, MapPin, Palette, Activity, FileText, Ticket } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Only super_admin can access
    if (user.role !== "super_admin") {
        redirect("/vendor/dashboard");
    }

    const navItems = [
        { label: "Dashboard", href: "/admin/dashboard", icon: Shield },
        { label: "Hotels", href: "/admin/hotels", icon: Building },
        { label: "Destinations", href: "/admin/destinations", icon: MapPin },
        { label: "Templates", href: "/admin/templates", icon: Palette },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Plans", href: "/admin/subscriptions", icon: CreditCard },
        { label: "Transactions", href: "/admin/transactions", icon: TrendingUp },
        { label: "Withdrawals", href: "/admin/withdrawals", icon: CreditCard },
        { label: "Domains", href: "/admin/domains", icon: Globe },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
        { label: "Settings", href: "/admin/settings", icon: Settings },
        { label: "Frontend", href: "/admin/frontend", icon: Layout },
        { label: "Pages", href: "/admin/pages", icon: FileText },
        { label: "Offers", href: "/admin/offers", icon: Ticket },
        { label: "Bookings", href: "/admin/bookings", icon: FileText },
        { label: "Support Desk", href: "/admin/support", icon: Shield },
    ];

    return (
        <div className="flex min-h-screen bg-gray-900">
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-700 flex items-center gap-2">
                    <div className="w-8 h-8 relative">
                        <img src="/logo.png" alt="Admin Panel" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl text-white">Admin Panel</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            SA
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Super Admin</p>
                            <Link href="/api/auth/logout" className="text-xs text-red-400 hover:underline flex items-center gap-1">
                                <LogOut className="h-3 w-3" /> Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 md:ml-64 p-8 bg-gray-900 text-white">
                {children}
            </main>
        </div>
    );
}
