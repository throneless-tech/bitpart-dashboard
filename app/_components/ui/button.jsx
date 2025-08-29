import {
  AbsoluteCenter,
  Button as ChakraButton,
  Span,
  Spinner,
} from "@chakra-ui/react";
import * as React from "react";

// fonts
import { geistMono } from "@/app/fonts";

// icons
import ArrowRight from "@/app/_icons/arrowRight";

export const Button = React.forwardRef(function Button(props, ref) {
  const {
    color,
    colorPalette,
    loading,
    disabled,
    loadingText,
    variant,
    children,
    ...rest
  } = props;
  return (
    <ChakraButton
      _active={{
        textDecoration: variant == "none" ? "underline" : "",
      }}
      _focus={{
        textDecoration: variant == "none" ? "underline" : "",
      }}
      _hover={{
        textDecoration: variant == "none" ? "underline" : "",
      }}
      borderRadius={8}
      className={geistMono.className}
      color={color ? color : "white"}
      colorPalette={colorPalette}
      disabled={loading || disabled}
      fontSize={16}
      fontWeight={600}
      height="48px"
      paddingX={variant == "none" ? 0 : 4}
      ref={ref}
      {...rest}
      textTransform="uppercase"
      variant={variant ? variant : "solid"}
    >
      {loading && !loadingText ? (
        <>
          <AbsoluteCenter display="inline-flex">
            <Spinner size="inherit" color="inherit" />
          </AbsoluteCenter>
          <Span opacity={0}>{children}</Span>
          <ArrowRight color={color} />
        </>
      ) : loading && loadingText ? (
        <>
          <Spinner size="inherit" color="inherit" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {variant === "none" ? null : (
            <ArrowRight color={colorPalette ? "white" : color} />
          )}
        </>
      )}
    </ChakraButton>
  );
});
