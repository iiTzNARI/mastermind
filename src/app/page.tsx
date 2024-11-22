"use client";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box p={4} textAlign="center" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="brand.300">
        Mastermind Game
      </Heading>
      <Text mb={4}>Choose a game mode:</Text>
      <Stack direction={{ base: "column", sm: "row" }} gap={4} justify="center">
        <Button onClick={() => router.push("/singleplayer")}>
          Single Player
        </Button>
        <Button onClick={() => router.push("/multiplayer")}>Multiplayer</Button>
      </Stack>
    </Box>
  );
}
