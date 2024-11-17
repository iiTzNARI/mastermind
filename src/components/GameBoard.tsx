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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";

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

      // フィードバックをそのまま新しい順にセット
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
              isDisabled={!isMyTurn}
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

        <Tabs variant="unstyled" mt={4}>
          <TabList bg="gray.700" borderRadius="md" p={1}>
            <Tab
              _selected={{ bg: "gray.900", color: "white" }}
              borderRadius="md"
            >
              <LuUser style={{ marginRight: "8px" }} />
              自分の結果
            </Tab>
            <Tab
              _selected={{ bg: "gray.900", color: "white" }}
              borderRadius="md"
            >
              {/* <LuFolder style={{ marginRight: "8px" }} /> */}
              <LuUser style={{ marginRight: "8px" }} />
              相手の結果
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box overflowY="auto" maxH="300px">
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="gray.700">
                    <Tr>
                      <Th color="white">Guess</Th>
                      <Th color="white">Hit</Th>
                      <Th color="white">Blow</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {myFeedbacks.map((feedback, index) => (
                      <Tr key={index}>
                        <Td>{feedback.guess}</Td>
                        <Td>{feedback.hits}</Td>
                        <Td>{feedback.blows}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box overflowY="auto" maxH="300px">
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="gray.700">
                    <Tr>
                      <Th color="white">Guess</Th>
                      <Th color="white">Hit</Th>
                      <Th color="white">Blow</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {opponentFeedbacks.map((feedback, index) => (
                      <Tr key={index}>
                        <Td>{feedback.guess}</Td>
                        <Td>{feedback.hits}</Td>
                        <Td>{feedback.blows}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <ExitButton
          roomId={roomId}
          playerId={playerId}
          onPlayerExit={() => setPlayerExited(true)}
        />
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
