import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { WebsocketProvider } from "@/components/socket";
import { cn } from "@/lib/utils";

const inter = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
    title: "Mad Lyrics",
    description: "Multiplayer, Music, and Mad Libs 😋",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.className, "bg-jas-black")}>
                <WebsocketProvider>{children}</WebsocketProvider>
            </body>
        </html>
    );
}
