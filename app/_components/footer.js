// chakra ui
import { ClientOnly, Flex, IconButton } from "@chakra-ui/react";

// icons imports
import Crown from "@/app/_icons/crown";
import Github from "@/app/_icons/github";

export default function Footer({ color }) {
  return (
    <ClientOnly>
      <Flex justifyContent="flex-end" position="absolute" bottom={0} right={0}>
        <IconButton
          as="a"
          href="https://throneless.tech"
          size="2xl"
          variant="ghost"
          style={{
            transform: "rotate(180deg)",
          }}
        >
          <Crown color={color} />
        </IconButton>
        <IconButton
          as="a"
          href="https://github.com/throneless-tech/bitpart"
          size="2xl"
          variant="ghost"
        >
          <Github color={color} />
        </IconButton>
      </Flex>
    </ClientOnly>
  );
}
