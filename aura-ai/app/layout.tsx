import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aura | Beauty Appointments",
  description: "Find salons, book appointments, and explore services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
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
