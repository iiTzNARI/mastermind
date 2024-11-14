// src/app/page.tsx
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";

export default function HomePage() {
  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="brand.300">
        Mastermind Game
      </Heading>
      <Text mb={4} color="gray.300">
        Choose a game mode:
      </Text>
      <Stack
        direction={{ base: "column", sm: "row" }}
        spacing={4}
        justify="center"
      >
        <Button
          as={Link}
          href="/singleplayer"
          variant="solid"
          colorScheme="brand"
        >
          Single Player
        </Button>
        <Button
          as={Link}
          href="/multiplayer"
          variant="solid"
          colorScheme="blue"
        >
          Multiplayer
        </Button>
      </Stack>
    </Box>
  );
}
