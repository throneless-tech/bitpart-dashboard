// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Container } from "@chakra-ui/react";

// component imports
import EditBotFlow from "@/app/components/edit";
import Header from "@/app/components/header";
import NotAuthenticated from "@/app/components/notAuthenticated";

export default async function Edit({ params }) {
  const { id } = await params;
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <EditBotFlow botId={id} userId={session.id} />
    </Box>
  );
}
