import Image from "next/image";
import styles from "./page.module.css";
import { Box } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";

export default function Home() {
  return (
    <Box>
      <ColorModeButton />
    </Box>
  );
}
