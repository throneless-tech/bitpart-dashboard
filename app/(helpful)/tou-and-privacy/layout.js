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
    "Bitpart is a messaging tool designed for human rights organizations, activists, journalists and human rights defenders working in repressive political environments at risk of surveillance. It enables you to send and receive secure, automated messages to a particular community over Signal by creating your own bot.",
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
