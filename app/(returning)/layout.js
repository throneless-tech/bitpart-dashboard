// base imports
import React from "react";

// chakra provider
import { Provider } from "@/app/_components/ui/provider";

// auth session provider
import { SessionProvider } from "next-auth/react";

// import localFont from "next/font/local";
// import "./globals.css";

// const geistSans = localFont({
//   src: "../fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "../fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata = {
  title: "Bitpart Dashboard",
  description: "A dashboard for interfacing with Bitpart.",
};

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <Provider>{children}</Provider>
    </SessionProvider>
  );
}
