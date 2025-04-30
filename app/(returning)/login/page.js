// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { LoginForm } from "../../components/login";

// components
import { ColorModeButton } from "@/app/components/ui/color-mode";

export default function Login() {
  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Heading as="a" href="/">
            Bitpart
          </Heading>
        </Flex>
      </Container>
      <Container py={6}>
        <LoginForm />
      </Container>
    </Box>
  );
}
