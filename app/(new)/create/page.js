// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Container } from "@chakra-ui/react";

// component imports
import Create from "@/app/_components/create";
import NotAuthenticated from "@/app/_components/notAuthenticated";

export default async function CreatePage() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return <Create session={session} />;
}
