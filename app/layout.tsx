// app/layout.tsx
// Root layout — font imports, global CSS, providers

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HookLabs AI — Viral Short-Form Video Pipeline",
    template: "%s | HookLabs AI",
  },
  description:
    "Autonomous AI-powered pipeline that turns trending topics into publish-ready YouTube Shorts and TikToks in minutes.",
  keywords: ["youtube shorts", "tiktok", "AI video", "content creation", "viral hooks"],
  openGraph: {
    title: "HookLabs AI",
    description: "Turn trending topics into viral short-form videos with AI",
    type: "website",
  },
};

import { SupabaseProvider } from '@/app/components/providers/SupabaseProvider'
import { SmoothScrollProvider } from '@/app/components/providers/SmoothScrollProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SupabaseProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
