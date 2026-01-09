import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Casa Javorai | Gestión de Espacios",
  description: "Sistema de gestión de alquiler de espacios para Casa Javorai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
