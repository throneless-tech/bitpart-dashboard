// base imports
import React from "react";
import { auth } from "@/auth";

// auth imports
import { signOut } from "@/auth";

// chakra ui imports
import { Box, Button, Container, Flex, Link } from "@chakra-ui/react";
import { ColorModeButton } from "@/app/components/ui/color-mode";

export default async function Header() {
  const session = await auth();

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <Flex gap={4}>
            <ColorModeButton />
            <Link href="/dashboard">Home</Link>
          </Flex>
          <Flex gap={4}>
            <Button>Donate</Button>
            {session ? (
              <form
                action={async () => {
                  "use server";
                   
                  try {
                    await signOut({ redirectTo: "/?message=SignOutSuccess" });
                  } catch (error) {
                    throw error;
                  }
                   
                }}
              >
                <Button type="submit" variant="underline">
                  Logout
                </Button>
              </form>
            ) : (
              <Link color={color} href="/login" variant="underline">
                Login
              </Link>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
