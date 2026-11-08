import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { localeDirection, routing } from "@/i18n/routing";
import "@fontsource-variable/vazirmatn";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#e11d48",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("title"),
    description: t("description"),
    applicationName: "آریا",
    manifest: "/manifest.webmanifest",
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      title: "آریا",
      statusBarStyle: "black",
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
    icons: {
      icon: [
        {
          url: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
