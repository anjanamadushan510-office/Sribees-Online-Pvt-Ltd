import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Inter,
  Montserrat,
  Poppins,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { getAppLocale } from "@/i18n/server";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  variable: "--font-poppins",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const abhayaLibre = localFont({
  src: "../../public/fonts/abhayalibre.ttf",
  variable: "--font-sinhala",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0D80-0DFF, U+200C-200D, U+25CC",
    },
  ],
});

export const metadata: Metadata = {
  title: "SRIBEES Online | Virtual Grocery Network Sri Lanka",
  description:
    "Sri Lanka's virtual supermarket. Shop your everyday groceries online and get them delivered to your doorstep.",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      { url: "/favicon_io/favicon.ico" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAppLocale();

  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${inter.variable} ${montserrat.variable} ${poppins.variable} ${abhayaLibre.variable} ${locale === "si" ? "font-sinhala" : ""} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
