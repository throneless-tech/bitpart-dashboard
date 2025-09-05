"use server";

// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import { Box, Button, Container, Stack, Text } from "@chakra-ui/react";

// component imports
import Header from "@/app/_components/header";
import NotAuthenticated from "@/app/_components/notAuthenticated";
import { Summary } from "@/app/_components/forms/summary";

export default async function View({ params }) {
  const { id } = await params;
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container py={6} maxW="3xl">
        <Summary botId={id} username={session?.user?.name} />
      </Container>
    </Box>
  );
}
