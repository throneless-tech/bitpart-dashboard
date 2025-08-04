// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Container, Heading, Text } from "@chakra-ui/react";

// components
import Header from "@/app/components/header";
import BotsList from "@/app/components/botsList";
import NotAuthenticated from "@/app/components/notAuthenticated";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginY={3} maxW="2xl">
        <Heading as="h1" size="3xl" marginBottom={8}>
          Welcome, {session?.user?.name}
        </Heading>
        <Box>
          <BotsList username={session?.user?.name} />
        </Box>
      </Container>
    </Box>
  );
}
