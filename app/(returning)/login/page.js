"use client";

// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { LoginForm } from "../../_components/login";

// components
import Footer from "@/app/_components/footer";
import Header from "@/app/_components/header";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

export default function Login() {
  // color mode
  const color = useColorModeValue("purple.600", "purple.400");

  return (
    <Box>
      <Container py={6}>
        <Header />
      </Container>
      <Container py={[6, 12]}>
        <LoginForm />
      </Container>
      <Footer color={color} />
    </Box>
  );
}
