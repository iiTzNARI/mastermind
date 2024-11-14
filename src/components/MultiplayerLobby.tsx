// src/components/MultiplayerLobby.tsx
import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";

export default function MultiplayerLobby({
  onJoinRoom,
}: {
  onJoinRoom: (roomId: string, code: string) => void;
}) {
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 3桁の数字が異なるかを確認する関数
  const isUniqueDigits = (num: string) => {
    return new Set(num).size === num.length;
  };

  const createRoom = async () => {
    if (userCode.length !== 3 || !isUniqueDigits(userCode)) {
      setError("3桁の数字を入力し、すべての桁を異なるようにしてください。");
      return;
    }
    setError(null);

    try {
      const roomRef = await addDoc(collection(db, "rooms"), {
        playerCodes: { player1: userCode, player2: "" },
        createdAt: new Date(),
        playerCount: 1,
        players: [],
      });
      setCreatedRoomId(roomRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check console for details.");
    }
  };

  const handleJoinRoom = () => {
    if (createdRoomId) {
      onJoinRoom(createdRoomId, userCode);
    }
  };

  return (
    <Box
      p={4}
      bg="gray.800"
      color="gray.50"
      borderRadius="md"
      boxShadow="md"
      maxW="md"
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="brand.300"
          textAlign="center"
        >
          Multiplayer Lobby
        </Text>
        <Input
          placeholder="3桁の数字を入力"
          maxLength={3}
          value={userCode}
          onChange={(e) => setUserCode(e.target.value.replace(/[^0-9]/g, ""))}
          size="lg"
          variant="outline"
          colorScheme="brand"
          borderColor="gray.500"
          focusBorderColor="brand.500"
        />
        {error && <Text color="red.500">{error}</Text>}

        <Button
          onClick={createRoom}
          variant="solid"
          colorScheme="brand"
          width="full"
        >
          Create Room
        </Button>

        {createdRoomId && (
          <Box textAlign="center">
            <Text>Room Created! ID: {createdRoomId}</Text>
            <Button
              onClick={handleJoinRoom}
              variant="solid"
              colorScheme="blue"
              mt={2}
            >
              Go to Room
            </Button>
          </Box>
        )}

        <Input
          placeholder="Enter Room ID to join"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          size="lg"
          variant="outline"
          colorScheme="brand"
          borderColor="gray.500"
          focusBorderColor="brand.500"
        />
        <Button
          onClick={() => onJoinRoom(roomCode, userCode)}
          variant="solid"
          colorScheme="brand"
        >
          Join Room
        </Button>
      </VStack>
    </Box>
  );
}
