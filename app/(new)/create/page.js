// base imports
import React from "react";
import { auth } from "@/app/auth";

// chakra ui imports
import { Box } from "@chakra-ui/react";

// component imports
import CreateBotFlow from "@/app/components/create";
import Header from "@/app/components/header";
import NotAuthenticated from "@/app/components/notAuthenticated";

export default async function Create() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Header />
      <CreateBotFlow userId={session.id} />
    </Box>
  );
}
