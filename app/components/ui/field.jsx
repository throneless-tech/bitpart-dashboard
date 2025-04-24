"use client"
import * as React from 'react'

// chakra imports
import {
  Field as ChakraField,
  IconButton,
  List,
  Text
} from '@chakra-ui/react'

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
import PrivacyPolicyText from "@/app/components/drawer/privacyPolicy"

// icons
import { LuInfo } from "react-icons/lu";

export const Field = React.forwardRef(function Field(props, ref) {
  const { label, info, children, helperText, errorText, optionalText, ...rest } =
    props

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
                  {info == "description" ? (
                    <>
                      <Text>
                        This is where we will offer an example of what a description may look like and include.
                      </Text>
                      <Text marginTop={4}>
                        It's not safe out here. It's wondrous, with treasures to satiate desires both subtle and gross; but it's not for the timid. When dreams become more important than reality, you give up travel, building, creating; you even forget how to repair the machines left behind by your ancestors. You just sit living and reliving other lives left behind in the thought records. It's hard to believe that something which is neither seen nor felt can do so much harm. To Boldly Go Where No Man Has Gone Before... …Warp speed.
                      </Text>
                    </>
                  ) : info == "safetyTips" ? (
                    <>
                      <Text>
                        This is where we will offer a description and an example of what a safety tips may look like and include.
                      </Text>
                      <Text marginTop={2}>
                        Madness has no purpose. Or reason. But it may have a goal. Improve a mechanical device and you may double productivity. But improve man, you gain a thousandfold. Instruments register only through things they're designed to register. Space still contains infinite unknowns.
                      </Text>
                    </>
                  ) : info == "privacyPolicy" ? (
                    <PrivacyPolicyText />
                  ) : info == "activationInstructions" ? (
                    <>
                      <Text>
                        This is where we will offer a description and an example of what activation instructions may look like and include.
                      </Text>
                      <Text marginTop={2}>
                        Your will to survive, your love of life, your passion to know ... Everything that is truest and best in all species of beings has been revealed to you. Those are the qualities that make a civilization worthy to survive.
                      </Text>
                      <Text marginTop={2}>
                        Make It So!
                      </Text>
                    </>
                  ) : info == "helpInstructions" ? (
                    <>
                      <Text>
                        This is where we will offer a description and an example of what help instructions may look like and include.
                      </Text>
                      <Text marginTop={2}>
                        To be human is to be complex. You can't avoid a little ugliness -- from within -- and from without. It's hard to believe that something which is neither seen nor felt can do so much harm. Khaaannnn!
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
  )
})
