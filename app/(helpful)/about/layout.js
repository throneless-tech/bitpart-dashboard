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
  title: "About us ● Bitpart",
  description:
    "Bitpart is a project developed by Throneless Tech, a technology worker-cooperative specialized in building technology and providing digital security trainings for social justice oriented community organizations, activist groups, and non-profits.",
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
