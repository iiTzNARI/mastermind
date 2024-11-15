"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  Text,
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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
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
import ExitButton from "../../components/ExitButton";

const floatingLabelStyles = {
  position: "absolute" as const,
  top: "-8px",
  left: "10px",
  backgroundColor: "gray.800",
  paddingX: "1",
  fontSize: "sm",
  color: "gray.500",
  transition: "0.2s ease",
};

export default function Multiplayer() {
  const [view, setView] = useState<
    "initial" | "create" | "join" | "waiting" | "game" | "full"
  >("initial");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [playerId] = useState(uuidv4());
  const { hasCopied, onCopy } = useClipboard(roomId || "");
  const roomDeletionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (roomDeletionTimeout.current) {
        clearTimeout(roomDeletionTimeout.current);
      }
    };
  }, []);

  const hasUniqueDigits = (value: string) => {
    return new Set(value).size === value.length;
  };

  const handlePinChange = (value: string) => {
    setUserCode(value);
    if (value.length === 3 && !hasUniqueDigits(value)) {
      setError("3桁の数字はすべて異なる必要があります");
    } else {
      setError("");
    }
  };

  const handleComplete = (value: string) => {
    if (!hasUniqueDigits(value)) {
      setError("3桁の数字はすべて異なる必要があります");
    } else {
      setError("");
    }
  };

  const handleCreateRoom = async () => {
    const roomRef = await addDoc(collection(db, "rooms"), {
      playerCount: 0, // 初期設定は 0
      isRoomActive: false,
      players: [], // 空の配列で初期化
      isRoomDeleted: false,
    });
    setRoomId(roomRef.id);
    setView("create");

    // 部屋削除タイムアウトを設定
    roomDeletionTimeout.current = setTimeout(async () => {
      try {
        await updateDoc(roomRef, { isRoomDeleted: true });
        await deleteDoc(roomRef);
        console.log("Room deleted automatically due to inactivity.");
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    }, 3 * 60 * 60 * 1000);
  };

  const handleJoinRoom = () => {
    setView("join");
  };

  const handleGameStart = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);

      await runTransaction(db, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef);
        const data = roomSnapshot.data();

        if (!data) return;

        // 既存のプレイヤー数に基づいて、プレイヤーを追加し playerCount を更新
        const updatedPlayerCount = data.playerCount + 1;
        const playerPosition = updatedPlayerCount === 1 ? "player1" : "player2";

        // プレイヤー情報を設定
        transaction.update(roomRef, {
          playerCount: updatedPlayerCount, // プレイヤー数を更新
          [`playerCodes.${playerPosition}`]: userCode,
          players: [...(data.players || []), playerId], // プレイヤーIDを追加
        });

        // 2人目のプレイヤーが「Game Start」を押した時点でターン設定
        if (updatedPlayerCount === 2) {
          const opponentId = data.players[0];
          const randomFirstPlayerId =
            Math.random() < 0.5 ? playerId : opponentId;

          transaction.update(roomRef, {
            isRoomActive: true,
            currentTurn: randomFirstPlayerId, // ランダムに最初のターンを設定
          });
        }
      });

      setView("waiting");

      // プレイヤー数が2人になるまでリアルタイムで監視し、2人揃ったらゲームを開始
      onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.playerCount === 2 && data?.isRoomActive) {
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
        const data = roomSnapshot.data();

        if (!data) throw new Error("Room does not exist!");

        const playerPosition = data.playerCount === 1 ? "player2" : "player1";
        const updatedPlayerCount = data.playerCount + 1;

        transaction.update(roomRef, {
          playerCount: updatedPlayerCount,
          [`playerCodes.${playerPosition}`]: userCode,
          players: [...(data.players || []), playerId],
        });

        // プレイヤー数が2人揃った場合にのみターンをランダムに設定
        if (updatedPlayerCount === 2) {
          const opponentId =
            data.players[0] === playerId ? data.players[1] : data.players[0];
          const randomFirstPlayerId =
            Math.random() < 0.5 ? playerId : opponentId;
          transaction.update(roomRef, {
            currentTurn: randomFirstPlayerId,
            isRoomActive: true,
          });
        }
      });

      setRoomId(inputRoomId);
      setView("waiting");

      // プレイヤー数をリアルタイムで監視し、2人揃ったらゲームを開始
      onSnapshot(roomRef, (snapshot) => {
        const updatedData = snapshot.data();
        if (updatedData?.playerCount === 2 && updatedData?.isRoomActive) {
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
    setView("initial");
  };

  const RoomIdDisplay = (
    <InputGroup size="md" width="100%">
      <Input pr="4.5rem" value={roomId || ""} isReadOnly />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={onCopy}>
          {hasCopied ? "Copied" : "Copy"}
        </Button>
      </InputRightElement>
    </InputGroup>
  );

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
          <Button colorScheme="gray" onClick={() => setView("initial")}>
            Back to Home
          </Button>
        </VStack>
      )}

      {view === "create" && roomId && (
        <VStack spacing={4} maxWidth="sm" width="100%">
          <Text>Room ID:</Text>
          {RoomIdDisplay}
          <Text>Enter your 3-digit code:</Text>
          <FormControl isInvalid={!!error}>
            <HStack spacing={2} justify="center">
              <PinInput
                size="lg"
                type="number"
                value={userCode}
                onChange={handlePinChange}
                onComplete={handleComplete}
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleGameStart}
            isDisabled={userCode.length !== 3 || !!error}
          >
            Game Start
          </Button>
          <ExitButton roomId={roomId || ""} playerId={playerId} />
        </VStack>
      )}

      {view === "join" && (
        <VStack spacing={4}>
          <FormControl position="relative">
            <Input
              placeholder=" "
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              _placeholder={{ color: "transparent" }}
            />
            <FormLabel sx={floatingLabelStyles}>Room ID</FormLabel>
          </FormControl>
          <Text>Enter your 3-digit code:</Text>
          <FormControl isInvalid={!!error}>
            <HStack spacing={2} justify="center">
              <PinInput
                size="lg"
                type="number"
                value={userCode}
                onChange={handlePinChange}
                onComplete={handleComplete}
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="green"
            onClick={handleRoomJoin}
            isDisabled={
              inputRoomId.length === 0 || userCode.length !== 3 || !!error
            }
          >
            Game Start
          </Button>
        </VStack>
      )}

      {view === "waiting" && (
        <VStack spacing={4} maxWidth="sm" width="100%">
          <Text>対戦相手を待っています...</Text>
          <Spinner color="blue.300" size="md" />
          {roomId && (
            <>
              <Text>Room ID:</Text>
              {RoomIdDisplay}
            </>
          )}
          <ExitButton roomId={roomId || ""} playerId={playerId} />
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
