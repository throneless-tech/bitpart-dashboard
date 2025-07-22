// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Container } from "@chakra-ui/react";

// component imports
import CreateBotFlow from "@/app/_components/create";
import Header from "@/app/_components/header";
import NotAuthenticated from "@/app/_components/notAuthenticated";

export default async function Create() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <CreateBotFlow userId={session.id} />
    </Box>
  );
}
