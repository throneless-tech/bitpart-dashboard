"use client";
import { useSession } from "next-auth/react";

// chakra ui imports
import { Box, Container, Heading, Spinner, Text } from "@chakra-ui/react";

// components imports
import BotsList from "@/app/_components/botsList";
import Footer from "@/app/_components/footer";
import Header from "@/app/_components/header";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { funnel } from "@/app/fonts";

export default function Dashboard({ session }) {
  const color = useColorModeValue("purple.600", "purple.400");

  return (
    <>
      <Container py={6}>
        <Header session={session} />
        <Heading as="h1" className={funnel.className} marginY={8} size="3xl">
          Welcome, {session?.user?.name}
        </Heading>

        <Box marginTop={12}>
          <BotsList username={session?.user?.name} />
        </Box>
      </Container>
      <Footer color={color} />
    </>
  );
}
