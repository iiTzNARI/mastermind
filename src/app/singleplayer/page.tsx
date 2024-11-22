"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Text,
  VStack,
  Table,
  Stack,
  Input,
} from "@chakra-ui/react";
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
import { Field } from "@/components/ui/field";

export default function Singleplayer() {
  const [guess, setGuess] = useState<string[]>(["", "", ""]);
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isValidGuess = (value: string[]) =>
    value.every((digit) => digit !== "") &&
    new Set(value).size === value.length;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newGuess = [...guess];
      newGuess[index] = value;
      setGuess(newGuess);

      setError(
        !isValidGuess(newGuess) ? "3桁の数字はすべて異なる必要があります" : ""
      );
    }
  };

  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: guess.join("") }),
    });
    const data = await response.json();

    if (data.feedback) {
      setFeedbacks([
        {
          guess: guess.join(""),
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

    setGuess(["", "", ""]);
  };

  const handleExit = () => router.push("/");

  return (
    <Box p={4} minH="100vh" textAlign="center" bgColor="red.300">
      <VStack gap={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          Single Player - Mastermind
        </Text>
        <Box display="flex" justifyContent="center">
          <Field invalid={!!error} errorText={error}>
            <Stack direction="row" justify="center" gap={2}>
              {guess.map((digit, index) => (
                <Input
                  key={index}
                  value={digit}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="0"
                  maxLength={1}
                  type="text"
                  textAlign="center"
                  width="40px"
                  borderColor="gray.100"
                />
              ))}
            </Stack>
          </Field>
        </Box>
        <Button
          onClick={handleGuess}
          colorScheme="brand"
          disabled={guess.some((digit) => digit === "") || !!error}
        >
          Submit Guess
        </Button>
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
