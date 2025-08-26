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

// icon imports
import { RiEditLine } from "react-icons/ri";

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
        <Stack
          alignItems={["flex-start", "center", "center"]}
          direction={["column", "row"]}
          justifyContent="space-between"
        >
          <Text>Here is your bot summary:</Text>
          <Button as="a" href={`/my-bots/edit/${id}`} variant="outline">
            <Text as="span" paddingTop={2}>
              Edit
            </Text>
            <RiEditLine />
          </Button>
        </Stack>
        <Summary botId={id} username={session?.user?.name} />
      </Container>
    </Box>
  );
}
