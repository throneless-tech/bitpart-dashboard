import { Box, Flex } from "@chakra-ui/react";

export default function Art() {
  return (
    <Flex
      gap={4}
      justifyContent={["center"]}
      marginLeft={[0, 4, 4, 20]}
      position="relative"
    >
      <Box
        position="relative"
        height={[40, 40, "80%"]}
        width={[14, 14, 82]}
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
      <Box
        position="relative"
        height={[40, 40, "80%"]}
        width={[14, 14, 82]}
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
      <Box
        position="relative"
        height={[40, 40, "80%"]}
        width={[14, 14, 82]}
        _before={{
          backgroundColor: "yellow.300",
          borderRadius: 8,
          content: "''",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      <Box
        position="relative"
        height={[40, 40, "80%"]}
        width={[14, 14, 82]}
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
        bottom={[0, 0, "30px"]}
        height={["160px", "160px", "90%"]}
        left={[6, 200, "-14%"]}
        position="absolute"
        width={["84px", "84px", 60]}
        _after={{
          backgroundImage: "url(/mushroom-1.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          content: "''",
          display: "block",
          height: ["160px", "100%", "82%"],
          width: "100%",
        }}
      />
      <Box
        bottom={[0, 0, 2]}
        height={["100%", "100%", "80%", "80%"]}
        left={[0, 200, "unset"]}
        position="absolute"
        right={["unset", "unset", 0]}
        width={["400px", "400px", "400px", "500px"]}
        _after={{
          backgroundImage: "url(/mushroom-2.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          content: "''",
          display: "block",
          height: ["100%", "100%", "80%"],
          position: "absolute",
          width: "100%",
          zIndex: "-5",
        }}
      />
    </Flex>
  );
}
