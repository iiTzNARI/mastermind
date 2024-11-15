// src/components/GameBoard.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
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
  playerId: string; // 親コンポーネントから渡されるplayerId
}

export default function GameBoard({ roomId, playerId }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentCode, setOpponentCode] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        const playerCodes = data.playerCodes || {};
        const playerKey =
          data.players?.[0] === playerId ? "player1" : "player2";

        // 対戦相手のコードを設定
        setOpponentCode(
          playerKey === "player1"
            ? playerCodes.player2 || ""
            : playerCodes.player1 || ""
        );

        // 勝敗が決定した場合の判定処理
        if (data.winner) {
          const isCurrentPlayerWinner = data.winner === playerId;
          setIsWinner(isCurrentPlayerWinner);
          setIsLoser(!isCurrentPlayerWinner);
          setShowModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
  };

  const finalizeRoom = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
  };

  const handleGuess = async () => {
    if (isWinner || isLoser) return;

    const feedback = calculateFeedback(guess, opponentCode);
    setFeedbacks([
      ...feedbacks,
      { guess, hits: feedback.hits, blows: feedback.blows },
    ]);
    setGuess("");

    if (feedback.hits === 3) handleWin();
  };

  const handleCloseModal = () => {
    finalizeRoom().then(() => {
      router.push("/");
    });
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack spacing={4} align="stretch">
        <HStack justify="center">
          <PinInput value={guess} onChange={setGuess} size="lg" type="number">
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
        <ExitButton roomId={roomId} playerId={playerId} />
      </VStack>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isWinner ? "Victory!" : "Defeat"}</ModalHeader>
          <ModalBody>
            <Text>{isWinner ? "Congratulations!" : "Try again."}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
