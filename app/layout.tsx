import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "lesliechiunda.com";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  return {
    metadataBase,
    title: {
      default: "Leslie Chiunda — Digital products & websites",
      template: "%s — Leslie Chiunda",
    },
    description:
      "Independent full-stack developer and digital studio building useful websites, apps, commerce experiences and business platforms in South Africa.",
    openGraph: {
      type: "website",
      title: "Leslie Chiunda — Websites built to move business forward",
      description: "Strategy, design and full-stack development for ambitious South African businesses.",
      images: [{ url: new URL("/og.png", metadataBase).toString(), width: 1731, height: 909, alt: "Leslie Chiunda digital studio" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Leslie Chiunda — Websites built to move business forward",
      description: "Strategy, design and full-stack development from Johannesburg.",
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
