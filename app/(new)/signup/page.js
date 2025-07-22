// base imports
import React from "react";

// chakra ui imports
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";

// components
import { ColorModeButton } from "@/app/_components/ui/color-mode";
import Header from "@/app/_components/header";
import { SignupForm } from "@/app/_components/signup";

export default function Signup() {
  return (
    <Box>
      <Container py={6}>
        <Header />
      </Container>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Heading as="a" href="/">
            Bitpart
          </Heading>
        </Flex>
      </Container>
      <Container py={6} maxW="lg">
        <Text marginBottom={12}>
          Choose a unique username and password, and store this somewhere safe.
          Since we do not collect your email, we will not be able to send you a
          password reset if you forget your credentials.
        </Text>
        <SignupForm />
      </Container>
    </Box>
  );
}
