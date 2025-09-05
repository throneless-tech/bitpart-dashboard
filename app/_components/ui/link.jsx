// chakra ui imports
import { Link as ChakraLink } from "@chakra-ui/react";

export const Link = ({ children, href, variant }) => (
  <ChakraLink
    colorPalette="purple"
    href={href}
    variant={variant ? variant : "underline"}
  >
    {children}
  </ChakraLink>
);
