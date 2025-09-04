"use client";

// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Link, Text } from "@chakra-ui/react";

// components
import Footer from "@/app/_components/footer";
import Header from "@/app/_components/header";
import { SignupForm } from "@/app/_components/signup";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

export default function Signup() {
  const color = useColorModeValue("purple.600", "purple.400");

  return (
    <Box>
      <Container py={6}>
        <Header />
      </Container>
      <Container py={12} maxW="lg">
        <Text marginBottom={12}>
          Choose a unique username and password, and store this somewhere safe.
          If you need to change your password, email us:{" "}
          <Link color={color} href="mailto:contact@bitp.art">
            contact@bitp.art
          </Link>
        </Text>
        <SignupForm />
      </Container>
      <Footer color={color} />
    </Box>
  );
}
