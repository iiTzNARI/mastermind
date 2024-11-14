// src/components/MultiplayerLobby.tsx
import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  PinInput,
  PinInputField,
  HStack,
} from "@chakra-ui/react";

export default function MultiplayerLobby({
  onJoinRoom,
}: {
  onJoinRoom: (roomId: string, code: string) => void;
}) {
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isUniqueDigits = (num: string) => {
    return new Set(num).size === num.length;
  };

  const createRoom = async () => {
    try {
      if (userCode.length !== 3 || !isUniqueDigits(userCode)) {
        setError("3桁の数字を入力し、すべての桁を異なるようにしてください。");
        return;
      }
      setError(null);

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

  const handleComplete = (value: string) => {
    setUserCode(value);
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.300">
          Enter Your Code
        </Text>
        <HStack spacing={2} justify="center">
          <PinInput size="lg" onComplete={handleComplete} type="number">
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
        {error && <Text color="red.500">{error}</Text>}
        <Button
          onClick={createRoom}
          colorScheme="green"
          isDisabled={userCode.length !== 3}
        >
          Create Room
        </Button>
        {createdRoomId && (
          <VStack spacing={2} mt={4}>
            <Text>
              Room Created! ID: <strong>{createdRoomId}</strong>
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => onJoinRoom(createdRoomId, userCode)}
            >
              Go to Room
            </Button>
          </VStack>
        )}
        <VStack mt={4} spacing={2}>
          <Text>Enter Room ID to join:</Text>
          <Input
            placeholder="Room ID"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            size="lg"
            maxW="xs"
          />
          <Button
            colorScheme="blue"
            mt={2}
            onClick={() => onJoinRoom(roomCode, userCode)}
            isDisabled={roomCode.length === 0}
          >
            Join Room
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
