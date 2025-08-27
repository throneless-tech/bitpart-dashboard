"use client";

// base imports
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// fonts
import { geistMono } from "@/app/fonts";

// actions imports
import { logout } from "@/app/_actions/logout";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  Portal,
  VisuallyHidden,
} from "@chakra-ui/react";

// components imports
import { Button } from "@/app/_components/ui/button";
import {
  ColorModeButton,
  useColorModeValue,
} from "@/app/_components/ui/color-mode";
import { toaster } from "@/app/_components/ui/toaster";

// icons imports
import LogoWordmark from "@/app/_icons/logo-wordmark";
import MenuIcon from "@/app/_icons/menu";

export default function Header(props) {
  const router = useRouter();
  const color = useColorModeValue("black", "white");
  const textColor = useColorModeValue("purple.600", "purple.400");
  const { session } = props;

  useEffect(() => {}, [session]);

  // submit form to attempt user login
  async function onSubmit(formData) {
    try {
      const res = await logout();

      if (res.success) {
        router.push("/");
      } else {
        console.log(res.message);
        toaster.create({
          title: "Logout not successful. Contact an administrator.",
          type: "error",
        });
      }
    } catch (error) {
      console.log(error);
      toaster.create({
        title: "Logout not successful. Contact an administrator.",
        type: "error",
      });
    }
  }

  return (
    <Box
      className={geistMono.className}
      fontWeight={600}
      textTransform="uppercase"
    >
      <ClientOnly>
        <Flex gap={8} justify="space-between" width="100%">
          <Heading as="h1">
            <Link as="a" href="/" width={200}>
              <VisuallyHidden>Bitpart</VisuallyHidden>
              <LogoWordmark color={color} />
            </Link>
          </Heading>
          <Flex gap={1}>
            <ColorModeButton />
            <Flex hideFrom="md">
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton variant="none">
                    <MenuIcon color={color} />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      className={geistMono.className}
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {session ? (
                        <>
                          <Menu.Item paddingY={2}>
                            <Link
                              color={textColor}
                              href="/bots"
                              variant="plain"
                            >
                              My Bots
                            </Link>
                          </Menu.Item>
                          <Menu.Item paddingY={2}>
                            <form action={onSubmit}>
                              <Button
                                color={textColor}
                                type="submit"
                                variant="none"
                              >
                                Logout
                              </Button>
                            </form>
                          </Menu.Item>
                        </>
                      ) : (
                        <Menu.Item paddingY={2}>
                          <Link color={textColor} href="/login" variant="plain">
                            Login
                          </Link>
                        </Menu.Item>
                      )}
                      <Menu.Item paddingY={2}>
                        <Link color={textColor} href="/about" variant="plain">
                          About Us
                        </Link>
                      </Menu.Item>
                      <Menu.Item paddingY={2}>
                        <Link color={textColor} href="/faq" variant="plain">
                          FAQ
                        </Link>
                      </Menu.Item>
                      <Menu.Item paddingY={2}>
                        <Link
                          color={textColor}
                          href="/tou-and-privacy"
                          variant="plain"
                        >
                          Terms of Use and Privacy
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link color={textColor} href="/login" variant="plain">
                          Donate
                        </Link>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>
          </Flex>
        </Flex>
        <Box hideBelow="md" marginTop={2}>
          <Flex justifyContent="space-between">
            <Flex gap={4}>
              <ClientOnly>
                {session && (
                  <Link color={textColor} href="/bots" variant="plain">
                    My Bots
                  </Link>
                )}
                <Link color={textColor} href="/about" variant="plain">
                  About Us
                </Link>
                <Link color={textColor} href="/faq" variant="plain">
                  FAQ
                </Link>
                <Link color={textColor} href="/tou-and-privacy" variant="plain">
                  Terms of Use and Privacy
                </Link>
              </ClientOnly>
            </Flex>
            <Flex gap={4}>
              <Button as="a" colorPalette="purple" href="#">
                Donate
              </Button>
              <ClientOnly>
                {session ? (
                  <form action={onSubmit}>
                    <Button color={textColor} type="submit" variant="none">
                      Logout
                    </Button>
                  </form>
                ) : (
                  <Link color={textColor} href="/login" variant="plain">
                    Login
                  </Link>
                )}
              </ClientOnly>
            </Flex>
          </Flex>
        </Box>
      </ClientOnly>
    </Box>
  );
}
