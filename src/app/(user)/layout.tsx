import { getCurrentUser } from "@/lib/auth/token";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db/connect";
import { SiteConfig } from "@/lib/db/models/SiteConfig";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tokenUser = await getCurrentUser();
    let dbUser = null;

    if (tokenUser?.userId) {
        await connectDB();
        const { User } = await import("@/lib/db/models/User"); // Dynamic import to avoid circular dep if any
        dbUser = await User.findById(tokenUser.userId).select('profile role email phone name');
    }

    const user = dbUser ? {
        ...tokenUser,
        name: dbUser.profile?.name || dbUser.name,
        role: dbUser.role,
        avatar: dbUser.profile?.avatar
    } : tokenUser;

    // Fetch Site Config
    await connectDB();
    const config = await SiteConfig.findOne().sort({ updatedAt: -1 });

    // Serializable config
    const plainConfig = config ? JSON.parse(JSON.stringify(config)) : null;

    return (
        <div className="min-h-screen flex flex-col">
            <Header config={plainConfig} user={user} />

            <main className="flex-1">
                {children}
            </main>

            <Footer config={plainConfig} />
        </div>
    );
}
