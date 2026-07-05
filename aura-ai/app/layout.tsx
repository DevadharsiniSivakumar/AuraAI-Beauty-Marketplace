import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${inter.variable} h-full antialiased`}
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
