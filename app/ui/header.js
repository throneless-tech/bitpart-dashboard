// auth imports
import { signOut } from "@/auth"

// chakra ui imports
import {
  Box,
  Button,
  Container,
  Flex,
  Link,
} from "@chakra-ui/react";
import { ColorModeButton } from "@/app/components/ui/color-mode";

export default async function Header () {

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Flex gap={4}>
            <Button>
              Donate
            </Button>
            <form
              action={async () => {
                "use server"
                try {
                  await signOut({redirectTo: '/?message=SignOutSuccess'});
                } catch (error) {
                  throw error;
                }
              }}
            >
            <Button
              type="submit"
              variant='underline'
            >
              Logout
            </Button>
            </form>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}