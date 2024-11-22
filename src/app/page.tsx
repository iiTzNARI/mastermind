"use client";
import { useRouter } from "next/navigation"; // 修正：next/navigation から useRouter をインポート
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function HomePage() {
  const router = useRouter(); // 修正：useRouter を next/navigation のものに変更

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="brand.300">
        Mastermind Game
      </Heading>
      <Text mb={4} color="gray.300">
        Choose a game mode:
      </Text>
      <Stack direction={{ base: "column", sm: "row" }} gap={4} justify="center">
        <Button
          variant="solid"
          colorScheme="brand"
          onClick={() => router.push("/singleplayer")} // ページ遷移
        >
          Single Player
        </Button>
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={() => router.push("/multiplayer")} // ページ遷移
        >
          Multiplayer
        </Button>
      </Stack>
    </Box>
  );
}
