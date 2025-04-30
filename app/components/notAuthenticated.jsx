"use client";

// chakra ui imports
import {
  Box,
  Center,
  ClientOnly,
  Container,
  Heading,
  Link,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";

// components imports
import { useColorModeValue } from "@/app/components/ui/color-mode";

export default function NotAuthenticated() {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <ClientOnly>
      <Box>
        <Container marginY={10} padding={8}>
          <Center>
            <Stack>
              <Heading as="h1">Not authenticated</Heading>
              <Text as="div">You are not authorized to view this page.</Text>
              <Text>
                Try{" "}
                <Link color={color} href="/login" variant="underline">
                  logging in
                </Link>{" "}
                or{" "}
                <Link color={color} href="/" variant="underline">
                  signing up
                </Link>
                .
              </Text>
            </Stack>
          </Center>
        </Container>
      </Box>
    </ClientOnly>
  );
}
