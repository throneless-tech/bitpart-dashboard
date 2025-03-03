import { Provider } from "@/components/ui/provider";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
// import "./globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Bitpart Dashboard",
  description: "A dashboard for interfacing with Bitpart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <Provider>{children}</Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
