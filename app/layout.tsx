import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope, Newsreader, DM_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Curtain } from "@/components/layout/Curtain";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { clinic } from "@/content/clinic";
import "./globals.css";
import "./pages.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dmmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(clinic.site),
  title: {
    default: "Dental Studio | Private Dentistry",
    template: "%s",
  },
  description:
    "Private dentistry for people who notice the details. Dental Studio — crafted restorations, implants, and care.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F0EEE9",
};

const themeScript = `try{var t=localStorage.getItem("dental.theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${manrope.variable} ${newsreader.variable} ${dmMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{overflow-x:clip}html{scrollbar-color:var(--muted-soft) transparent}",
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <Curtain />
        <MotionProvider />
        <main id="main">{children}</main>
        <Footer />
        <AssistantWidget />
      </body>
    </html>
  );
}
