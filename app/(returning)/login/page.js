// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { LoginForm } from "../../_components/login";

// components
import Header from "@/app/_components/header";

export default function Login() {
  return (
    <Box>
      <Container py={6}>
        <Header />
      </Container>
      <Container py={6}>
        <LoginForm />
      </Container>
    </Box>
  );
}
