import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
import ExitButton from "./ExitButton";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import ResultMultiModal from "./ResultMultiModal";
import OpponentExitModal from "./OpponentExitModal";
import NumberInputForm from "./NumberInputForm";
import ResultTabsMulti from "./ResultTabsMulti";

interface GameBoardProps {
  roomId: string;
  playerId: string;
}

export default function GameBoard({ roomId, playerId }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [myFeedbacks, setMyFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentFeedbacks, setOpponentFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentCode, setOpponentCode] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [opponentExited, setOpponentExited] = useState(false);
  const [playerExited, setPlayerExited] = useState(false);
  const [error, setError] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      const {
        playerCount,
        players = [],
        playerCodes = {},
        winner,
        currentTurn,
        feedbacks,
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

      const playerKey = players[0] === playerId ? "player1" : "player2";
      const calculatedOpponentId =
        playerKey === "player1" ? players[1] : players[0];
      setOpponentId(calculatedOpponentId);
      setOpponentCode(
        playerKey === "player1"
          ? playerCodes.player2 || ""
          : playerCodes.player1 || ""
      );

      setIsMyTurn(currentTurn === playerId);

      setMyFeedbacks(feedbacks?.[playerId] || []);
      setOpponentFeedbacks(feedbacks?.[calculatedOpponentId] || []);
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  const hasUniqueDigits = (value: string) => {
    return new Set(value).size === value.length;
  };

  const handlePinChange = (value: string) => {
    setGuess(value);
    if (value.length === 3 && !hasUniqueDigits(value)) {
      setError("All three digits must be unique.");
    } else {
      setError("");
    }
  };

  const handleComplete = (value: string) => {
    if (!hasUniqueDigits(value)) {
      setError("All three digits must be unique.");
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
      !opponentId
    )
      return;

    const feedback = calculateFeedback(guess, opponentCode);
    const feedbackEntry = { guess, hits: feedback.hits, blows: feedback.blows };

    const roomRef = doc(db, "rooms", roomId);
    await runTransaction(db, async (transaction) => {
      const roomSnapshot = await transaction.get(roomRef);
      const data = roomSnapshot.data();

      if (!data) {
        throw new Error("Room data not found.");
      }

      const updatedFeedbacks = {
        ...(data.feedbacks || {}),
        [playerId]: [feedbackEntry, ...(data.feedbacks?.[playerId] || [])],
      };

      transaction.update(roomRef, {
        feedbacks: updatedFeedbacks,
        currentTurn: opponentId,
      });
    });

    if (feedback.hits === 3) {
      handleWin();
    }
    setGuess("");
  };

  const handleCloseModal = () => {
    finalizeRoom().then(() => {
      router.push("/");
    });
  };

  const handleOpponentExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    try {
      await updateDoc(roomRef, {
        players: arrayRemove(playerId),
      });

      router.push("/");
    } catch (error) {
      console.error("Error during opponent exit:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack gap={4} align="center">
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={isMyTurn ? "green.300" : "red.300"}
        >
          {isMyTurn ? "Make your move" : "Waiting for your opponent's move"}
        </Text>
        {isMyTurn ? "" : <Spinner color="blue.300" size="md" />}

        <NumberInputForm
          guess={guess}
          error={error}
          label="Submit"
          isMyTurn={isMyTurn}
          onInputChange={handlePinChange}
          onComplete={handleComplete}
          onSubmit={handleGuess}
        />

        <ResultTabsMulti
          myFeedbacks={myFeedbacks}
          opponentFeedbacks={opponentFeedbacks}
        />

        <ExitButton
          roomId={roomId}
          playerId={playerId}
          onPlayerExit={() => setPlayerExited(true)}
        />
      </VStack>

      <ResultMultiModal
        isOpen={showModal}
        onClose={handleCloseModal}
        isWinner={isWinner}
      />

      {!playerExited && (
        <OpponentExitModal
          isOpen={opponentExited}
          onClose={handleOpponentExit}
          roomId={roomId}
          playerId={playerId}
        />
      )}
    </Box>
  );
}
