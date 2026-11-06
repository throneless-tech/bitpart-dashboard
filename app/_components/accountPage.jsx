"use client";

// chakra ui imports
import { Box, Container, Heading } from "@chakra-ui/react";

// components
import Footer from "@/app/_components/footer";
import Header from "@/app/_components/header";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { geistMono } from "@/app/fonts";

// page shared by the account pages (forgot/reset password, confirm email)
export default function AccountPage({ children, session, title }) {
  const color = useColorModeValue("purple.600", "purple.400");

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container py={[6, 12]} maxW="lg">
        <Heading
          as="h1"
          className={geistMono.className}
          marginBottom={8}
          size="xl"
        >
          {title}
        </Heading>
        {children}
      </Container>
      <Footer color={color} />
    </Box>
  );
}
