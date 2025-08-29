// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Container, Heading, Text } from "@chakra-ui/react";

// components
import Header from "@/app/_components/header";
import BotsList from "@/app/_components/botsList";
import NotAuthenticated from "@/app/_components/notAuthenticated";

// fonts
import { funnel } from "@/app/fonts";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginY={3} maxW="2xl">
        <Heading
          as="h1"
          className={funnel.className}
          marginBottom={8}
          size="3xl"
        >
          Welcome, {session?.user?.name}
        </Heading>
        <Box>
          <BotsList username={session?.user?.name} />
        </Box>
      </Container>
    </Box>
  );
}
