"use client";

// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Text } from "@chakra-ui/react";

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
          Since we do not collect your email, we will not be able to send you a
          password reset if you forget your credentials.
        </Text>
        <SignupForm />
      </Container>
      <Footer color={color} />
    </Box>
  );
}
