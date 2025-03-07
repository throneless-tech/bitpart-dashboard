// chakra ui imports
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text
} from "@chakra-ui/react";

// components
import { ColorModeButton } from "@/app/components/ui/color-mode";
import { LoginForm } from "./ui/login";
import { ToastAlert } from "./ui/toastalert";

export default function Home() {

  return (
    <Box>
      <ToastAlert />
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Button>
            Donate
          </Button>
        </Flex>
      </Container>
      <Container marginBottom={6} maxW="2xl">
        <Heading
          as='h1'
          marginTop={8}
          size='3xl'
          textAlign='center'
        >
          Welcome to Bitpart.
        </Heading>
        <Text marginTop={4}>
          Bitpart is... they used to say that if Man was meant to fly, he'd have wings. But he did fly. He discovered he had to. Leave bigotry in your quarters; there's no room for it on the bridge. To all mankind -- may we never find space so vast, planets so cold, heart and mind so empty that we cannot fill them with love and warmth. You know the greatest danger facing us is ourselves, and irrational fear of the unknown. There is no such thing as the unknown. 
        </Text>
        <Box marginTop={4} textAlign='center'>
          <Text marginBottom={8}>
            Ready to get started? Login now:
          </Text>
          <LoginForm />
        </Box>
      </Container>
    </Box>
  )
}