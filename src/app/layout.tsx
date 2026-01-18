import type { Metadata } from "next";
import { Inter, Mina } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const mina = Mina({ weight: ["400", "700"], subsets: ["bengali"], variable: '--font-mina' });

export const metadata: Metadata = {
    title: "Hotelify - Kuakata's Best Hotel Management",
    description: "Simplifying hospitality for Kuakata and beyond.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="bn">
            <body className={`${inter.variable} ${mina.variable} font-sans bg-gray-50`}>
                {children}
                <Toaster position="top-center" />
            </body>
        </html>
    );
}
