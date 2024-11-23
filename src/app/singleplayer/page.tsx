"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text, VStack, Table } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import NumberInputForm from "@/components/NumberInputForm";

export default function Singleplayer() {
  const [guess, setGuess] = useState<string>(""); // 合わせて一つの文字列に変更
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isValidGuess = (value: string) =>
    value.length === 3 && new Set(value.split("")).size === value.length;

  const handleInputChange = (value: string) => {
    setGuess(value);
    setError(
      !isValidGuess(value) ? "3桁の数字はすべて異なる必要があります" : ""
    );
  };

  const handleComplete = (value: string) => {
    if (isValidGuess(value)) {
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
        {
          guess,
          hits: data.feedback.hits,
          blows: data.feedback.blows,
        },
        ...feedbacks,
      ]);
      setMessage(data.message || "");
      if (data.feedback.hits === 3) setIsWinner(true);
    } else {
      setMessage(data.message);
    }

    setGuess("");
  };

  const handleExit = () => router.push("/");

  return (
    <Box p={4} minH="100vh" textAlign="center">
      <VStack gap={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          Single Player - Mastermind
        </Text>

        {/* NumberInputForm の使用 */}
        <NumberInputForm
          guess={guess}
          error={error}
          label="Submit Guess"
          isMyTurn={true}
          onInputChange={handleInputChange}
          onComplete={handleComplete}
          onSubmit={handleGuess}
        />

        <Box overflowY="auto" maxH="300px" width="100%">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Guess</Table.ColumnHeader>
                <Table.ColumnHeader>Hits</Table.ColumnHeader>
                <Table.ColumnHeader>Blows</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {feedbacks.map((feedback, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{feedback.guess}</Table.Cell>
                  <Table.Cell>{feedback.hits}</Table.Cell>
                  <Table.Cell>{feedback.blows}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
        {message && <Text color="gray.500">{message}</Text>}
        <Button colorScheme="red" onClick={handleExit}>
          Exit
        </Button>
        <DialogRoot
          open={isWinner}
          onOpenChange={(isOpen) => !isOpen && handleExit()}
        >
          <DialogTrigger asChild>
            <Box />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congratulations!</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text>You won!</Text>
            </DialogBody>
            <DialogFooter>
              <Button colorScheme="blue" onClick={handleExit}>
                Back to Home
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Box>
  );
}
