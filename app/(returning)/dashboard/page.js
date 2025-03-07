// base imports
import { auth } from "@/auth";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Heading,
} from "@chakra-ui/react";

// components
import Header from "@/app/ui/header";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return <div>Not authenticated</div>

  return (
    <Box>
      <Header />
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