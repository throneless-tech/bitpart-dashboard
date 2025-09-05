// base imports
import React from "react";

//chakra provider
import { Provider } from "@/app/_components/ui/provider";

// fonts
import { geist } from "./fonts";

// auth session provider
import { SessionProvider } from "next-auth/react";

export const metadata = {
  metadataBase: new URL("https://bitp.art"),
  title: "Bitpart",
  description:
    "Bitpart is a one-to-many messaging tool that plugs into Signal. It was designed with rights defenders, activists and journalists operating in risky or repressive environments, and is intended for anyone needing to communicate with a large network safely over Signal.",
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
