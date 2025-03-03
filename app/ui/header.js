'use client'

// auth imports
import { signOut } from 'next-auth/react'

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Flex,
  Link,
} from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Header () {

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Flex gap={4}>
            <Button>
              Donate
            </Button>
            <Link
              href="/"
              onClick={async () => await signOut()}
              variant='underline'
            >
              Logout
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}