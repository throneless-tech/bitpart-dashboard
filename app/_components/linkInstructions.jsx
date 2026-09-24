"use client";

// chakra ui imports
import { Box, Flex, Link, List, QrCode, Text } from "@chakra-ui/react";

// components imports
import { LightMode } from "@/app/_components/ui/color-mode";

// icons imports
import Info from "@/app/_icons/info";

// qr code and instructions for linking a bot to a signal account
export default function LinkInstructions({ color, qrLink }) {
  return (
    <>
      <LightMode>
        <Box backgroundColor="#fff" width={200}>
          <QrCode.Root size="xl" value={qrLink}>
            <QrCode.Frame>
              <QrCode.Pattern />
            </QrCode.Frame>
          </QrCode.Root>
        </Box>
      </LightMode>
      <List.Root marginLeft={4} marginTop={4}>
        <List.Item>
          On your phone, open Signal and navigate to Signal Settings {">"}{" "}
          Linked devices.
        </List.Item>
        <List.Item>Tap the blue button: "Link a new device"</List.Item>
        <List.Item>Use your phone to scan the QR code.</List.Item>
      </List.Root>
      <Flex alignItems="center" direction="row" gap={2} marginTop={10}>
        <Box width={6}>
          <Info />
        </Box>
        <Text fontStyle="italic">
          You can find more information or troubleshoot by following{" "}
          <Link
            href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
            color={color}
            textDecoration="underline"
            target="_blank"
            variant="underline"
          >
            this link
          </Link>
          .
        </Text>
      </Flex>
    </>
  );
}
