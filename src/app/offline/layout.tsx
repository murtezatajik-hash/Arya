import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "آفلاین | آریا",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#e11d48",
  colorScheme: "dark",
};

export default function OfflineLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          backgroundColor: "#08080a",
          color: "#f5f5f6",
          fontFamily:
            'Vazirmatn, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          WebkitTextSizeAdjust: "100%",
        }}
      >
        {children}
      </body>
    </html>
  );
}
