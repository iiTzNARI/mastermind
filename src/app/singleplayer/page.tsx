"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Text,
  VStack,
  // PinInput,
  // PinInputField,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormErrorMessage,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
const PinInput = dynamic(
  () => import("@chakra-ui/react").then((mod) => mod.PinInput),
  { ssr: false }
);
const PinInputField = dynamic(
  () => import("@chakra-ui/react").then((mod) => mod.PinInputField),
  { ssr: false }
);

export default function Singleplayer() {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  const hasUniqueDigits = (value: string) => {
    return new Set(value).size === value.length;
  };

  const handleComplete = (value: string) => {
    setGuess(value);
    if (value.length === 3 && !hasUniqueDigits(value)) {
      setError("3桁の数字はすべて異なる必要があります");
    } else {
      setError("");
    }
  };

  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess }),
    });
    const data = await response.json();

    if (data.feedback) {
      setFeedbacks([
        { guess, hits: data.feedback.hits, blows: data.feedback.blows },
        ...feedbacks, // 新しいフィードバックを先頭に追加
      ]);
      setMessage(data.message || "");
      if (data.feedback.hits === 3) {
        setIsWinner(true);
      }
    } else {
      setMessage(data.message);
    }

    setGuess("");
    setPinInputKey((prevKey) => prevKey + 1);
  };

  const handleExit = () => {
    router.push("/");
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.300">
          Single Player - Mastermind
        </Text>
        <FormControl isInvalid={!!error}>
          <HStack spacing={2} justify="center">
            <PinInput
              key={pinInputKey}
              size="lg"
              onComplete={handleComplete}
              type="number"
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
          isDisabled={guess.length !== 3 || !!error}
        >
          Submit Guess
        </Button>

        <Box mt={4} overflowY="auto" maxH="300px" width="100%">
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} bg="gray.700">
              <Tr>
                <Th color="white">Guess</Th>
                <Th color="white">Hits</Th>
                <Th color="white">Blows</Th>
              </Tr>
            </Thead>
            <Tbody>
              {feedbacks.map((feedback, index) => (
                <Tr key={index}>
                  <Td>{feedback.guess}</Td>
                  <Td>{feedback.hits}</Td>
                  <Td>{feedback.blows}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {message && (
          <Text mt={4} color="gray.300">
            {message}
          </Text>
        )}

        <Button mt={6} colorScheme="red" onClick={handleExit}>
          退室する
        </Button>

        <Modal isOpen={isWinner} onClose={handleExit}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>おめでとうございます！</ModalHeader>
            <ModalBody>
              <Text>あなたが勝ちました！</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleExit}>
                ホームに戻る
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}
