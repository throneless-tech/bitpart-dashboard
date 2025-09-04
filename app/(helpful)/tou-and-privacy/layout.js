import React from "react";
import { Provider } from "@/app/_components/ui/provider";
// import localFont from "next/font/local";
// import "./globals.css";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata = {
  metadataBase: new URL("https://bitp.art"),
  title: "Terms of Service and Privacy Policy ● Bitpart",
  description:
    "Bitpart is a one-to-many messaging tool that plugs into Signal. It was designed with rights defenders, activists and journalists operating in risky or repressive environments, and is intended for anyone needing to communicate with a large network safely over Signal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
