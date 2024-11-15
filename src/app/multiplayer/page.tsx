// src/app/multiplayer/page.tsx
"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
  Input,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { db } from "../../utils/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import GameBoard from "../../components/GameBoard"; // GameBoardコンポーネントをインポート

export default function Multiplayer() {
  const [view, setView] = useState<
    "initial" | "create" | "join" | "waiting" | "game"
  >("initial");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");

  const handleCreateRoom = async () => {
    const roomRef = await addDoc(collection(db, "rooms"), {
      playerCount: 1,
      isRoomActive: true,
    });
    setRoomId(roomRef.id);
    setView("create");
  };

  const handleJoinRoom = () => {
    setView("join");
  };

  const handleGameStart = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, {
        playerCount: 2,
        playerCode: userCode,
      });
      setView("waiting");

      onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.playerCount === 2) {
          setView("game");
        }
      });
    }
  };

  const handleRoomJoin = async () => {
    setRoomId(inputRoomId);
    const roomRef = doc(db, "rooms", inputRoomId);
    await updateDoc(roomRef, { playerCount: 2 });
    setView("waiting");

    onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.playerCount === 2) {
        setView("game");
      }
    });
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="blue.300">
        Multiplayer - Mastermind
      </Heading>

      {view === "initial" && (
        <VStack spacing={4}>
          <Button colorScheme="blue" onClick={handleCreateRoom}>
            Create Room
          </Button>
          <Button colorScheme="green" onClick={handleJoinRoom}>
            Join Room
          </Button>
        </VStack>
      )}

      {view === "create" && roomId && (
        <VStack spacing={4}>
          <Text>Room ID: {roomId}</Text>
          <Text>Enter your 3-digit code:</Text>
          <HStack spacing={2} justify="center">
            <PinInput
              size="lg"
              type="number"
              onChange={(value) => setUserCode(value)} // onChangeを使用してリアルタイムに値を設定
              value={userCode}
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <Button
            colorScheme="blue"
            onClick={handleGameStart}
            isDisabled={userCode.length !== 3}
          >
            Game Start
          </Button>
        </VStack>
      )}

      {view === "join" && (
        <VStack spacing={4}>
          <Input
            placeholder="Enter Room ID"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
          />
          <Text>Enter your 3-digit code:</Text>
          <HStack spacing={2} justify="center">
            <PinInput
              size="lg"
              type="number"
              onChange={(value) => setUserCode(value)} // onChangeを使用してリアルタイムに値を設定
              value={userCode}
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <Button
            colorScheme="green"
            onClick={handleRoomJoin}
            isDisabled={inputRoomId.length === 0 || userCode.length !== 3}
          >
            Game Start
          </Button>
        </VStack>
      )}

      {view === "waiting" && (
        <VStack spacing={4}>
          <Text>対戦相手を待っています...</Text>
        </VStack>
      )}

      {view === "game" && roomId && userCode && (
        <GameBoard roomId={roomId} userCode={userCode} />
      )}
    </Box>
  );
}
