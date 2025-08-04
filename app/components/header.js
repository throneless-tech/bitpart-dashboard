"use client";

// base imports
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// actions imports
import { logout } from "@/app/actions/logout";

// chakra ui imports
import {
  Box,
  Button,
  ClientOnly,
  Flex,
  IconButton,
  Link,
  Menu,
  Portal,
} from "@chakra-ui/react";

// components imports
import {
  ColorModeButton,
  useColorModeValue,
} from "@/app/components/ui/color-mode";
import { toaster } from "@/app/components/ui/toaster";

// icons imports
import { RxHamburgerMenu } from "react-icons/rx";

export default function Header(props) {
  const router = useRouter();
  const color = useColorModeValue("maroon", "yellow");
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
      <Flex gap={4} hideFrom="md" justifyContent="space-between">
        <ColorModeButton />
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton>
              <RxHamburgerMenu />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {!session && (
                  <Menu.Item>
                    <Link color={color} href="/" variant="underline">
                      Bitpart
                    </Link>
                  </Menu.Item>
                )}
                {session ? (
                  <>
                    <Menu.Item>
                      <Link color={color} href="/my-bots" variant="underline">
                        My Bots
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <form action={onSubmit}>
                        <Button color={color} type="submit" variant="subtle">
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
      <Box hideBelow="md">
        <Flex justifyContent="space-between">
          <Flex gap={4}>
            <ColorModeButton />
            <ClientOnly>
              {!session && (
                <Link color={color} href="/" variant="underline">
                  Bitpart
                </Link>
              )}
              {session && (
                <Link color={color} href="/my-bots" variant="underline">
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
    </Box>
  );
}
