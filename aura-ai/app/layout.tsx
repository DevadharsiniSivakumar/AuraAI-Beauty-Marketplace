import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/RouteGuard";

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
      className="h-full antialiased font-sans"
    >
      <head>
        <style>{`
          :root {
            --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
            --font-playfair: 'Playfair Display', Georgia, Cambria, serif;
          }
        `}</style>
      </head>
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
