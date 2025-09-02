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
  title: "FAQ ● Bitpart",
  description:
    "Bitpart is an automated messaging platform designed for activists, journalists, and human rights defenders in repressive environments, and the organisations that support them, to set up helpdesks, tiplines, distribute VPNs or e-sims, or broadcast messages.",
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
