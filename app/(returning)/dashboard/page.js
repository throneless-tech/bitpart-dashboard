// base imports
import { auth } from "@/auth";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";

// components
import Header from "@/app/ui/header";
import BotsList from "@/app/components/botsList";

export default async function Dashboard() {
  const session = await auth();

  console.log('session: ', session);

  if (!session) return <div>Not authenticated</div>

  return (
    <Box>
      <Header />
      <Container
        marginY={3}
        maxW="2xl"
      >
        <Heading as="h1" size="3xl" marginBottom={8}>
          Dashboard
        </Heading>
        <Box>
          <BotsList userId={session.id} />
        </Box>
      </Container>
    </Box>
  )
}