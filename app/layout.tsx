import "@/app/_styles/globals.css";

import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Smart Bookmark App",
  description:
    "A realtime bookmark manager built with Next.js App Router, Supabase (Auth, Database, Realtime), and Tailwind CSS. Supports Google OAuth login, user-specific private bookmarks, and live multi-tab sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}
      >
        {children}
      </body>
    </html>
  );
}
