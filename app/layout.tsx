import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aura | Your Personal AI Beauty Concierge",
  description: "Discover luxury beauty services, find trusted salons, receive personalized style recommendations, and book appointments with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-rosegold-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-rosegold-100 selection:bg-rosegold-300 dark:selection:bg-rosegold-800">
        <AuthProvider>
          <RouteGuard>
            <AppProvider>
              {children}
            </AppProvider>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
