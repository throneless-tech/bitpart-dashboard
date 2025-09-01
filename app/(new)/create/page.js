"use client";

// base imports
import React from "react";
import { useSession } from "next-auth/react";

// chakra ui imports
import { Box, Container } from "@chakra-ui/react";

// component imports
import CreateBotFlow from "@/app/_components/create";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import NotAuthenticated from "@/app/_components/notAuthenticated";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

export default function Create() {
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");

  if (!session) return <NotAuthenticated />;

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <CreateBotFlow username={session?.user?.name} />
      <Box marginTop={12} position="relative">
        <Footer color={color} />
      </Box>
    </Box>
  );
}
