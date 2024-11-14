// src/app/singleplayer/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Text,
  VStack,
  PinInput,
  PinInputField,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

export default function Singleplayer() {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isWinner, setIsWinner] = useState(false); // 勝利フラグ
  const [pinInputKey, setPinInputKey] = useState(0);
  const router = useRouter();

  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess }),
    });
    const data = await response.json();

    if (data.feedback) {
      setFeedbacks([
        ...feedbacks,
        { guess, hits: data.feedback.hits, blows: data.feedback.blows },
      ]);
      setMessage(data.message || "");
      if (data.feedback.hits === 3) {
        setIsWinner(true); // 勝利時にモーダルを表示するために設定
      }
    } else {
      setMessage(data.message);
    }

    setGuess("");
    setPinInputKey((prevKey) => prevKey + 1); // PinInputをリセット
  };

  const handleComplete = (value: string) => {
    setGuess(value);
  };

  const handleExit = () => {
    router.push("/"); // ホーム画面に戻る
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.300">
          Single Player - Mastermind
        </Text>
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
        <Button
          onClick={handleGuess}
          variant="solid"
          colorScheme="brand"
          isDisabled={guess.length !== 3}
        >
          Submit Guess
        </Button>

        <Box mt={4} width="100%" maxW="sm">
          {feedbacks.map((feedback, index) => (
            <Box
              key={index}
              p={3}
              bg="gray.700"
              borderRadius="md"
              mb={2}
              textAlign="left"
            >
              <Text fontWeight="bold">Guess: {feedback.guess}</Text>
              <Text>
                Hits: {feedback.hits}, Blows: {feedback.blows}
              </Text>
            </Box>
          ))}
        </Box>

        {message && (
          <Text mt={4} color="gray.300">
            {message}
          </Text>
        )}

        {/* 退室するボタン */}
        <Button mt={6} colorScheme="red" onClick={handleExit}>
          退室する
        </Button>

        {/* 勝利時のモーダル */}
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
