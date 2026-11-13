"use client";
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

import { realEmail } from "@/app/_lib/placeholderEmail";

export const authClient = createAuthClient({ plugins: [usernameClient()] });

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

// login and logout happen in server actions, so tell the client to fetch
// the session again
export const refreshSession = () => authClient.$store.notify("$sessionSignal");
