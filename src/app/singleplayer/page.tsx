// src/app/singleplayer/page.tsx
"use client";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

export default function Singleplayer() {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    hits: number;
    blows: number;
  } | null>(null);
  const [message, setMessage] = useState("");

  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess }),
    });
    const data = await response.json();

    if (data.feedback) {
      setFeedback(data.feedback);
      setMessage(data.message || "");
    } else {
      setMessage(data.message);
    }
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <VStack spacing={4} maxW="sm" mx="auto" width="100%">
        <Text fontSize="2xl" fontWeight="bold" color="brand.300">
          Single Player - Mastermind
        </Text>
        <Input
          placeholder="3桁の数字を入力"
          maxLength={3}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          size="lg"
          variant="outline"
        />
        <Button onClick={handleGuess} variant="solid" colorScheme="brand">
          Submit Guess
        </Button>
        {feedback && (
          <Box>
            <Text color="gray.300">Hits: {feedback.hits}</Text>
            <Text color="gray.300">Blows: {feedback.blows}</Text>
          </Box>
        )}
        {message && (
          <Text mt={4} color="gray.300">
            {message}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
