// base imports
import React from "react";

//chakra provider
import { Provider } from "@/app/_components/ui/provider";

// fonts
import { geist } from "./fonts";

// auth session provider
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Bitpart",
  description: "A dashboard for interfacing with Bitpart.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Provider>{children}</Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
