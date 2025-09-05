// base imports
import React from "react";
import { auth } from "@/auth";

// components
import Dashboard from "@/app/_components/dashboard";
import NotAuthenticated from "@/app/_components/notAuthenticated";

export default async function MyBots() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return <Dashboard session={session} />;
}
