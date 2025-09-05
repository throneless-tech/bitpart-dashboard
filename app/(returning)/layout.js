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
  metadataBase: new URL("https://bitp.art"),
  title: "Bitpart",
  description:
    "Bitpart is a one-to-many messaging tool that plugs into Signal. It was designed with rights defenders, activists and journalists operating in risky or repressive environments, and is intended for anyone needing to communicate with a large network safely over Signal.",
};

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <Provider>{children}</Provider>
    </SessionProvider>
  );
}
