"use client";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

import { realEmail } from "@/app/_lib/placeholderEmail";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    // the login form shows the second-factor step itself, so don't redirect
    twoFactorClient({ onTwoFactorRedirect: () => {} }),
    passkeyClient(),
  ],
});

// the session in the shape the pages use: session.user.name is the username
export const useSession = () => {
  const { data, ...rest } = authClient.useSession();

  return {
    ...rest,
    data: data
      ? {
          user: {
            id: data.user.id,
            name: data.user.username,
            email: realEmail(data.user),
          },
        }
      : null,
  };
};

// logout and account changes happen in server actions, so tell the client to
// fetch the session again
export const refreshSession = () => authClient.$store.notify("$sessionSignal");
