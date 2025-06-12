// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header"; // Uncomment this line
import Footer from "@/components/Footer"; // Uncomment this line

// Remove or comment out this import
// import TestAuthPage from "./test-auth/page"; 

export const metadata: Metadata = {
  title: "Complians - Digital Compliance Products",
  description: "Professional compliance tools and resources for UK sponsors and immigration professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Header /> {/* Uncomment this line */}
          <main className="flex-1"> {/* Uncomment this line */}
            {children}
          </main> {/* Uncomment this line */}
          <Footer /> {/* Uncomment this line */}
        </AuthProvider>
      </body>
    </html>
  );
}
