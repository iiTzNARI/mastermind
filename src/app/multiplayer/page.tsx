// src/app/multiplayer/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
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
  InputGroup,
  InputRightElement,
  useClipboard,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { db } from "../../utils/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import GameBoard from "../../components/GameBoard";

export default function Multiplayer() {
  const [view, setView] = useState<
    "initial" | "create" | "join" | "waiting" | "game" | "full"
  >("initial");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [playerId] = useState(uuidv4()); // UUIDを生成してplayerIdとして保持
  const { hasCopied, onCopy } = useClipboard(roomId || "");
  const roomDeletionTimeout = useRef<NodeJS.Timeout | null>(null); // ルーム削除用のタイムアウトを保持
  const [showDeletionModal, setShowDeletionModal] = useState(false); // 削除モーダルの表示制御

  useEffect(() => {
    return () => {
      if (roomDeletionTimeout.current) {
        clearTimeout(roomDeletionTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);

      // リアルタイムでルームの削除フラグを監視
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.isRoomDeleted) {
          setShowDeletionModal(true);
        }
      });

      return () => unsubscribe();
    }
  }, [roomId]);

  const handleCreateRoom = async () => {
    const roomRef = await addDoc(collection(db, "rooms"), {
      playerCount: 1,
      isRoomActive: false,
      players: [playerId],
      isRoomDeleted: false, // 削除フラグを追加
    });
    setRoomId(roomRef.id);
    setView("create");

    // 5分後にルームを削除するタイムアウトを設定
    roomDeletionTimeout.current = setTimeout(async () => {
      try {
        await updateDoc(roomRef, { isRoomDeleted: true }); // 削除フラグを設定
        await deleteDoc(roomRef);
        console.log("Room deleted automatically due to inactivity.");
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    }, 3 * 60 * 60 * 1000); // 3 hours
  };

  const handleJoinRoom = () => {
    setView("join");
  };

  const handleGameStart = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);

      await updateDoc(roomRef, {
        playerCount: 1,
        isRoomActive: true,
        playerCodes: { player1: userCode },
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
    const roomRef = doc(db, "rooms", inputRoomId);
    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      alert("Room does not exist!");
      return;
    }

    const data = roomSnapshot.data();
    if (data && data.playerCount >= 2) {
      setView("full");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef);
        if (!roomSnapshot.exists()) {
          throw new Error("Room does not exist!");
        }

        const roomData = roomSnapshot.data();
        if (roomData && roomData.playerCount >= 2) {
          setView("full");
          return;
        }

        transaction.update(roomRef, {
          playerCount: (roomData?.playerCount || 0) + 1,
          [`playerCodes.player${(roomData?.playerCount || 0) + 1}`]: userCode,
          players: [...(roomData?.players || []), playerId],
        });
      });

      setRoomId(inputRoomId);
      setView("waiting");

      onSnapshot(roomRef, (snapshot) => {
        const updatedData = snapshot.data();
        if (updatedData?.playerCount === 2) {
          setView("game");
        }
      });
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred while joining the room.");
    }
  };

  const handleCloseModal = () => {
    setShowDeletionModal(false);
    setView("initial"); // モーダルを閉じると初期画面に戻る
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
              onChange={(value) => setUserCode(value)}
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
              onChange={(value) => setUserCode(value)}
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
          <Spinner color="blue.300" size="md" />
          {roomId && (
            <Box>
              <InputGroup size="md">
                <Input pr="4.5rem" value={roomId} isReadOnly />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={onCopy}>
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          )}
        </VStack>
      )}

      {view === "game" && roomId && userCode && (
        <GameBoard roomId={roomId} playerId={playerId} />
      )}

      {view === "full" && (
        <VStack spacing={4}>
          <Text color="red.500">
            This room is full. Please try another room.
          </Text>
          <Button colorScheme="blue" onClick={() => setView("initial")}>
            Back to Home
          </Button>
        </VStack>
      )}

      {/* ルーム削除モーダル */}
      <Modal isOpen={showDeletionModal} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Room Deleted</ModalHeader>
          <ModalBody>
            <Text>
              The room has been automatically deleted due to inactivity.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCloseModal}>
              Back to Home
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
