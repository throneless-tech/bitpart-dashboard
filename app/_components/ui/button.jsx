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
    children,
    ...rest
  } = props;
  return (
    <ChakraButton
      borderRadius={8}
      className={geistMono.className}
      colorPalette={colorPalette}
      disabled={loading || disabled}
      fontSize={16}
      fontWeight={600}
      height="48px"
      ref={ref}
      {...rest}
      textTransform="uppercase"
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
          <ArrowRight color={colorPalette ? "white" : color} />
        </>
      )}
    </ChakraButton>
  );
});
