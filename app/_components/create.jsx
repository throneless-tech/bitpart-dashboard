"use client";

// chakra ui imports
import { Box, Container } from "@chakra-ui/react";

// component imports
import CreateBotFlow from "./createFlow";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

export default function Create({ session }) {
  // color mode
  const color = useColorModeValue("purple.600", "purple.400");

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
