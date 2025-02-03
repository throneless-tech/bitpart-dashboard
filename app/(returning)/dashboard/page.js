// chakra ui imports
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Text
} from "@chakra-ui/react";

// components
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Dashboard() {

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Flex gap={4}>
            <Button>
              Donate
            </Button>
            <Link href="/" variant='underline'>
              Logout
            </Link>
          </Flex>
        </Flex>
      </Container>
      <Container
        marginY={3}
        maxW="2xl"
      >
        <Heading marginBottom={8}>
          Dashboard
        </Heading>
        <Box textAlign="center">
          <Button as='a' href='/create'>
            Create a new bot
          </Button>
        </Box>
      </Container>
    </Box>
  )
}