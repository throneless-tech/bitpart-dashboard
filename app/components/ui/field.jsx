"use client";
import * as React from "react";

// chakra imports
import { Field as ChakraField, IconButton, List, Text } from "@chakra-ui/react";

// components
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerActionTrigger,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/app/components/ui/drawer";
import PrivacyPolicyText from "@/app/components/drawer/privacyPolicy";
import SafetyTipsText from "@/app/components/drawer/safetyTips";

// icons
import { LuInfo } from "react-icons/lu";

export const Field = React.forwardRef(function Field(props, ref) {
  const {
    label,
    info,
    children,
    helperText,
    errorText,
    optionalText,
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);

  return (
    <ChakraField.Root ref={ref} {...rest}>
      {label && (
        <ChakraField.Label>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
          {info ? (
            <DrawerRoot
              open={open}
              onOpenChange={(e) => setOpen(e.open)}
              size="md"
            >
              <DrawerBackdrop />
              <DrawerTrigger asChild>
                <IconButton aria-label="See info and examples" variant="ghost">
                  <LuInfo />
                </IconButton>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Help</DrawerTitle>
                </DrawerHeader>
                <DrawerBody>
                  {info == "safetyTips" ? (
                    <SafetyTipsText />
                  ) : info == "privacyPolicy" ? (
                    <PrivacyPolicyText />
                  ) : info == "activationInstructions" ? (
                    <>
                      <Text>
                        This is where we will offer a description and an example
                        of what activation instructions may look like and
                        include.
                      </Text>
                      <Text marginTop={2}>
                        Your will to survive, your love of life, your passion to
                        know ... Everything that is truest and best in all
                        species of beings has been revealed to you. Those are
                        the qualities that make a civilization worthy to
                        survive.
                      </Text>
                      <Text marginTop={2}>Make It So!</Text>
                    </>
                  ) : info == "helpInstructions" ? (
                    <>
                      <Text>
                        This is where we will offer a description and an example
                        of what help instructions may look like and include.
                      </Text>
                      <Text marginTop={2}>
                        To be human is to be complex. You can't avoid a little
                        ugliness -- from within -- and from without. It's hard
                        to believe that something which is neither seen nor felt
                        can do so much harm. Khaaannnn!
                      </Text>
                    </>
                  ) : null}
                </DrawerBody>
                {/* <DrawerFooter>
                  <DrawerActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerActionTrigger>
                  <Button>Save</Button>
                </DrawerFooter> */}
                <DrawerCloseTrigger />
              </DrawerContent>
            </DrawerRoot>
          ) : null}
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
});
