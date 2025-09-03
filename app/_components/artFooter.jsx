import { Box, Flex } from "@chakra-ui/react";

export default function ArtFooter() {
  return (
    <>
      <Box
        position="relative"
        height={[40, 40, "24%"]}
        width="100%"
        _after={{
          backgroundImage: "url(/flower-1.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "45% 25%",
          backgroundSize: "100%",
          bottom: 0,
          content: "''",
          display: "block",
          height: "100%",
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
          width: "100%",
        }}
        _before={{
          backgroundColor: "teal.400",
          borderRadius: 8,
          content: "''",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      <Flex
        height="100%"
        gap={4}
        justifyContent={["space-between"]}
        marginTop={4}
        position="relative"
      >
        <Flex
          direction="column"
          gap={4}
          justifyContent={["space-between"]}
          _after={{
            backgroundImage: "url(/flower-1.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            bottom: 0,
            content: "''",
            display: "block",
            height: "90%",
            left: 0,
            position: "absolute",
            transform: "scaleX(-1)",
            width: "40%",
            zIndex: "-5",
          }}
        >
          <Box
            position="relative"
            height={[40, 40, "60%"]}
            width={[14, 14, 160]}
            _before={{
              backgroundColor: "red.500",
              borderRadius: 8,
              content: "''",
              height: "100%",
              left: 0,
              position: "absolute",
              top: 0,
              width: "100%",
              zIndex: "-10",
            }}
          />
          <Box
            position="relative"
            height={[40, 40, "60%"]}
            width={[14, 14, "100%"]}
            _before={{
              backgroundColor: "purple.600",
              borderRadius: 8,
              content: "''",
              height: "100%",
              left: 0,
              position: "absolute",
              top: 0,
              width: "100%",
              zIndex: "-10",
            }}
          />
        </Flex>
        <Box
          position="relative"
          height={[40, 40, "100%"]}
          width={[14, 14, 240]}
          _after={{
            backgroundImage: "url(/flower-1.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            content: "''",
            display: "block",
            height: "100%",
            width: "100%",
            zIndex: "-5",
          }}
          _before={{
            backgroundColor: "yellow.300",
            borderRadius: 8,
            content: "''",
            height: "100%",
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
            zIndex: "-10",
          }}
        />
      </Flex>
    </>
  );
}
