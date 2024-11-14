// src/components/GameBoard.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
import { v4 as uuidv4 } from "uuid";
import ExitButton from "./ExitButton";
import VictoryMessage from "./VictoryMessage";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";

interface GameBoardProps {
  roomId: string;
  userCode: string | null;
}

export default function GameBoard({ roomId, userCode }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentCode, setOpponentCode] = useState(""); // 相手の数字
  const [isWaiting, setIsWaiting] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
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
      const players = data.players || [];
      const playerKey = players.length === 0 ? "player1" : "player2";

      if (playerKey === "player2" && data.playerCodes) {
        await updateDoc(roomRef, { "playerCodes.player2": userCode });
      } else if (playerKey === "player1" && data.playerCodes) {
        await updateDoc(roomRef, { "playerCodes.player1": userCode });
      }

      setOpponentCode(
        playerKey === "player1"
          ? data.playerCodes.player2
          : data.playerCodes.player1
      );

      players.push(playerId);
      await updateDoc(roomRef, { playerCount: players.length, players });
      joinRoomCalled.current = true;
    };

    if (!joinRoomCalled.current) joinRoom();

    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        if ((isWinner || isLoser) && data.isRoomActive === false) {
          router.push("/");
          return;
        }

        if (data.isRoomActive === false && !isWinner && !isLoser) {
          const remainingPlayers = data.players || [];
          if (!remainingPlayers.includes(playerId)) {
            router.push("/");
          } else {
            alert("相手が退出しました");
            router.push("/");
          }
          return;
        }

        setIsWaiting(data.playerCount < 2);

        const playerKey = data.players[0] === playerId ? "player1" : "player2";
        setOpponentCode(
          playerKey === "player1"
            ? data.playerCodes.player2
            : data.playerCodes.player1
        );

        if (data.winner) {
          setIsWinner(data.winner === playerId);
          setIsLoser(data.winner !== playerId);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, userCode, isWinner, isLoser]);

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
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

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack spacing={4} align="stretch">
        {isWaiting ? (
          <Text fontSize="lg" color="brand.300">
            他のプレイヤーを待っています...
          </Text>
        ) : isWinner ? (
          <VictoryMessage />
        ) : isLoser ? (
          <Text fontSize="lg" color="red.500">
            あなたの負けです。
          </Text>
        ) : (
          <>
            <Input
              placeholder="3桁の数字を入力"
              maxLength={3}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              size="lg"
              variant="outline"
              colorScheme="brand"
              borderColor="gray.500"
              focusBorderColor="brand.500"
            />
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
    </Box>
  );
}
