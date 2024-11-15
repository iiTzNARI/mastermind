import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayRemove,
  getDoc,
  runTransaction,
} from "firebase/firestore";
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
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";

interface GameBoardProps {
  roomId: string;
  playerId: string;
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
  const [opponentExited, setOpponentExited] = useState(false);
  const [playerExited, setPlayerExited] = useState(false);
  const [error, setError] = useState(""); // エラーメッセージ
  const [isMyTurn, setIsMyTurn] = useState(false); // ターン情報
  const [opponentId, setOpponentId] = useState<string | null>(null); // opponentIdをstateで管理
  const router = useRouter();

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      const {
        playerCount,
        players = [],
        playerCodes = {},
        winner,
        currentTurn,
      } = data;

      if (!players.includes(playerId)) {
        setPlayerExited(true);
        return;
      }

      if (winner) {
        const isCurrentPlayerWinner = winner === playerId;
        setIsWinner(isCurrentPlayerWinner);
        setIsLoser(!isCurrentPlayerWinner);
        setShowModal(true);
      }

      if (playerCount < 2 && players.includes(playerId)) {
        setOpponentExited(true);
      }

      // 自分がplayer1かplayer2かを確認し、相手のplayerIdを設定
      const playerKey = players[0] === playerId ? "player1" : "player2";
      const calculatedOpponentId =
        playerKey === "player1" ? players[1] : players[0];
      setOpponentId(calculatedOpponentId); // opponentIdをstateに設定
      setOpponentCode(
        playerKey === "player1"
          ? playerCodes.player2 || ""
          : playerCodes.player1 || ""
      );

      // ターン情報を更新
      setIsMyTurn(currentTurn === playerId);
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  const hasUniqueDigits = (value: string) => {
    return new Set(value).size === value.length;
  };

  const handlePinChange = (value: string) => {
    setGuess(value);
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

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
  };

  const finalizeRoom = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
  };

  const handleGuess = async () => {
    if (
      !isMyTurn ||
      isWinner ||
      isLoser ||
      opponentExited ||
      error ||
      guess.length !== 3 ||
      !opponentId // opponentIdが正しく設定されているか確認
    )
      return;

    const feedback = calculateFeedback(guess, opponentCode);
    setFeedbacks([
      ...feedbacks,
      { guess, hits: feedback.hits, blows: feedback.blows },
    ]);
    setGuess("");

    if (feedback.hits === 3) {
      handleWin();
    } else {
      // ターンを相手に変更
      const roomRef = doc(db, "rooms", roomId);
      await runTransaction(db, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef);
        const data = roomSnapshot.data();

        if (!data) {
          throw new Error("Room data not found.");
        }

        // currentTurn を opponentId に変更
        transaction.update(roomRef, {
          currentTurn: opponentId,
        });
      }).catch((error) => {
        console.error("Failed to update turn:", error);
        alert("ターンの更新に失敗しました。もう一度お試しください。");
      });
    }
  };

  const handleCloseModal = () => {
    finalizeRoom().then(() => {
      router.push("/");
    });
  };

  const handleOpponentExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    try {
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists()) {
        alert("Room does not exist!");
        router.push("/");
        return;
      }

      const data = roomSnapshot.data();
      const currentCount = data?.playerCount || 0;

      await updateDoc(roomRef, {
        players: arrayRemove(playerId),
        playerCount: currentCount - 1,
      });

      const updatedSnapshot = await getDoc(roomRef);
      const updatedData = updatedSnapshot.data();
      if (updatedData?.playerCount === 0) {
        await deleteDoc(roomRef);
      }

      router.push("/");
    } catch (error) {
      console.error("Error during opponent exit:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack spacing={4} align="stretch">
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={isMyTurn ? "green.300" : "red.300"}
        >
          {isMyTurn ? "あなたのターンです" : "相手のターンです"}
        </Text>

        <FormControl isInvalid={!!error}>
          <HStack justify="center">
            <PinInput
              value={guess}
              onChange={handlePinChange}
              onComplete={handleComplete}
              size="lg"
              type="number"
              isDisabled={!isMyTurn} // 自分のターンでないと入力不可
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <Button
          onClick={handleGuess}
          variant="solid"
          colorScheme="brand"
          isDisabled={!isMyTurn || !!error || guess.length !== 3}
        >
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

        <ExitButton
          roomId={roomId}
          playerId={playerId}
          onPlayerExit={() => setPlayerExited(true)}
        />
      </VStack>

      {/* 勝敗モーダル */}
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

      {/* 相手退出モーダル */}
      {!playerExited && (
        <Modal isOpen={opponentExited} onClose={handleOpponentExit}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Opponent Left</ModalHeader>
            <ModalBody>
              <Text>The other player has exited the game.</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={handleOpponentExit}>
                Exit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
