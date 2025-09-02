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
  description:
    "Bitpart is a messaging tool designed for human rights organizations, activists, journalists and human rights defenders working in repressive political environments at risk of surveillance.",
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
