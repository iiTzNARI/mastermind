// src/app/multiplayer/page.tsx
"use client";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
import MultiplayerLobby from "../../components/MultiplayerLobby";
import GameBoard from "../../components/GameBoard";

export default function Multiplayer() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);

  const handleJoinRoom = (id: string, code: string) => {
    setRoomId(id);
    setUserCode(code);
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="blue.300">
        Multiplayer - Mastermind
      </Heading>
      <VStack spacing={4} maxW="sm" mx="auto" width="100%">
        {roomId ? (
          <GameBoard roomId={roomId} userCode={userCode} />
        ) : (
          <MultiplayerLobby onJoinRoom={handleJoinRoom} />
        )}
      </VStack>
    </Box>
  );
}
