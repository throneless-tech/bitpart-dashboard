"use client";

// base imports
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// actions imports
import { logout } from "@/app/_actions/logout";

// chakra ui imports
import {
  Box,
  Button,
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
    <Box>
      <ClientOnly>
        <Flex gap={8} justify="space-between" width="100%">
          <Heading as="h1">
            <Link as="a" href="/" width={[200, 340]}>
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
                    <Menu.Content>
                      {session ? (
                        <>
                          <Menu.Item>
                            <Link
                              color={color}
                              href="/bots"
                              variant="underline"
                            >
                              My Bots
                            </Link>
                          </Menu.Item>
                          <Menu.Item>
                            <form action={onSubmit}>
                              <Button
                                color={color}
                                type="submit"
                                variant="subtle"
                              >
                                Logout
                              </Button>
                            </form>
                          </Menu.Item>
                        </>
                      ) : (
                        <Menu.Item>
                          <Link color={color} href="/login" variant="underline">
                            Login
                          </Link>
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        <Link color={color} href="/about" variant="underline">
                          About Us
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link color={color} href="/faq" variant="underline">
                          FAQ
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          color={color}
                          href="/tou-and-privacy"
                          variant="underline"
                        >
                          Terms of Use and Privacy
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link color={color} href="/login" variant="underline">
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
        <Box hideBelow="md">
          <Flex justifyContent="space-between">
            <Flex gap={4}>
              <ClientOnly>
                {session && (
                  <Link color={color} href="/bots" variant="underline">
                    My Bots
                  </Link>
                )}
                <Link color={color} href="/about" variant="underline">
                  About Us
                </Link>
                <Link color={color} href="/faq" variant="underline">
                  FAQ
                </Link>
                <Link color={color} href="/tou-and-privacy" variant="underline">
                  Terms of Use and Privacy
                </Link>
              </ClientOnly>
            </Flex>
            <Flex gap={4}>
              <Button as="a" href="#">
                Donate
              </Button>
              <ClientOnly>
                {session ? (
                  <form action={onSubmit}>
                    <Button color={color} type="submit" variant="subtle">
                      Logout
                    </Button>
                  </form>
                ) : (
                  <Link color={color} href="/login" variant="underline">
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
