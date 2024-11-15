// src/components/GameBoard.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
import { v4 as uuidv4 } from "uuid";
import ExitButton from "./ExitButton";
import {
  Box,
  Button,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PinInput,
  PinInputField,
  HStack,
} from "@chakra-ui/react";

interface GameBoardProps {
  roomId: string;
  userCode: string | null;
}

export default function GameBoard({ roomId, userCode }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentCode, setOpponentCode] = useState("");
  const [isWaiting, setIsWaiting] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [playerId] = useState(uuidv4());
  const joinRoomCalled = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const joinRoom = async () => {
      if (joinRoomCalled.current) return;

      const roomSnapshot = await getDoc(roomRef);
      if (!roomSnapshot.exists()) {
        alert("Room does not exist!");
        return;
      }

      const data = roomSnapshot.data();
      const players = data?.players || [];
      const playerCodes = data?.playerCodes || {};
      const playerKey = players.length === 0 ? "player1" : "player2";

      if (playerKey === "player2") {
        await updateDoc(roomRef, { "playerCodes.player2": userCode });
      } else if (playerKey === "player1") {
        await updateDoc(roomRef, { "playerCodes.player1": userCode });
      }

      setOpponentCode(
        playerKey === "player1"
          ? playerCodes.player2 || ""
          : playerCodes.player1 || ""
      );

      players.push(playerId);
      await updateDoc(roomRef, { playerCount: players.length, players });
      joinRoomCalled.current = true;
    };

    if (!joinRoomCalled.current) joinRoom();

    const unsubscribe = onSnapshot(roomRef, async (docSnapshot) => {
      if (!docSnapshot.exists()) {
        return; // Room has already been deleted
      }

      const data = docSnapshot.data();

      if (data) {
        if ((isWinner || isLoser) && data.isRoomActive === false) {
          setShowModal(true);
          return;
        }

        setIsWaiting((data.playerCount || 0) < 2);

        const playerKey =
          data.players?.[0] === playerId ? "player1" : "player2";
        const playerCodes = data.playerCodes || {};
        setOpponentCode(
          playerKey === "player1"
            ? playerCodes.player2 || ""
            : playerCodes.player1 || ""
        );

        if (data.winner) {
          setIsWinner(data.winner === playerId);
          setIsLoser(data.winner !== playerId);
          setShowModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, userCode, isWinner, isLoser, router]);

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
  };

  const finalizeRoom = async () => {
    const roomRef = doc(db, "rooms", roomId);

    try {
      const roomSnapshot = await getDoc(roomRef);
      if (!roomSnapshot.exists()) {
        console.warn("Room does not exist, skipping deletion.");
        return;
      }

      // playerCountを0にせず、直接ルームを削除
      await deleteDoc(roomRef);
      console.log("Room successfully deleted after game end");
    } catch (error) {
      console.error("Error finalizing room:", error);
    }
  };

  const handleGuess = async () => {
    if (isWaiting || isWinner || isLoser) return;

    const feedback = calculateFeedback(guess, opponentCode);
    setFeedbacks([
      ...feedbacks,
      { guess, hits: feedback.hits, blows: feedback.blows },
    ]);
    setGuess("");

    if (feedback.hits === 3) handleWin();
  };

  // モーダルを閉じる際にルームを削除してホームに戻る
  const handleCloseModal = () => {
    finalizeRoom().then(() => {
      router.push("/");
    });
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack spacing={4} align="stretch">
        {isWaiting ? (
          <>
            <Text fontSize="lg" color="brand.300">
              他のプレイヤーを待っています...
            </Text>
            <Text fontSize="md" color="gray.300">
              ルームID: {roomId}
            </Text>
          </>
        ) : isWinner || isLoser ? null : (
          <>
            <HStack justify="center">
              <PinInput
                value={guess}
                onChange={setGuess}
                size="lg"
                type="number"
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
            <Button onClick={handleGuess} variant="solid" colorScheme="brand">
              Submit Guess
            </Button>
            <Box mt={4}>
              {feedbacks.map((feedback, index) => (
                <Box key={index} p={2} bg="gray.700" borderRadius="md" mb={2}>
                  <Text>Guess: {feedback.guess}</Text>
                  <Text>
                    Hits: {feedback.hits}, Blows: {feedback.blows}
                  </Text>
                </Box>
              ))}
            </Box>
          </>
        )}
        <ExitButton roomId={roomId} playerId={playerId} />
      </VStack>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isWinner ? "勝利!" : "敗北"}</ModalHeader>
          <ModalBody>
            <Text>
              {isWinner ? "おめでとうございます！" : "また挑戦してください。"}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCloseModal}>
              ホームに戻る
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
