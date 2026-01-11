import "@/app/globals.css";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { IntlayerClientProvider } from "next-intlayer";
import { IntlayerServerProvider } from "next-intlayer/server";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Madlen OpenRouter",
    description: "AI Chat Interface for OpenRouter",
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={inter.className}>
                <IntlayerServerProvider locale={locale}>
                    <IntlayerClientProvider locale={locale}>
                        <Providers>{children}</Providers>
                    </IntlayerClientProvider>
                </IntlayerServerProvider>
            </body>
        </html>
    );
}
