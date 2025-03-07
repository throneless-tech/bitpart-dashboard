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
import BotCard from "@/app/components/botCard";
import Header from "@/app/ui/header";

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
          {session.user.bots ? (
            <>
              <Heading as='h2' size="xl">
                My bots
              </Heading>
              <Stack
                direction={["column", "column", "row"]}
                gap={[4, 4, 8]}
                marginTop={4}
              >
              {session.user.bots.map((bot, index) => (
                <BotCard key={`${bot.botType}-${index}`} bot={bot} />
              ))}
              </Stack>
            </>
          ) : (
            <Text>You do not have any bots. Click below to create one.</Text>
          )}
          <Button marginTop={10} as='a' href='/create'>
            Create a new bot
          </Button>
        </Box>
      </Container>
    </Box>
  )
}