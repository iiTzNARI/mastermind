"use client";
// import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Text,
  VStack,
  // PinInput,
  // PinInputField,
  // HStack,
  // Modal,
  // ModalOverlay,
  // ModalContent,
  // ModalHeader,
  // ModalBody,
  // ModalFooter,
  // FormControl,
  // FormErrorMessage,
  Table,
  // Thead,
  // Tbody,
  // Tr,
  // Th,
  // Td,
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
// import { PinInput } from "@/components/ui/pin-input";

export default function Singleplayer() {
  const [guess, setGuess] = useState<string[]>(["", "", ""]);
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [message, setMessage] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  // const [pinInputKey, setPinInputKey] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  // ユニークな数字かどうかチェックする関数
  const isValidGuess = (value: string[]) => {
    return (
      value.every((digit) => digit !== "") &&
      new Set(value).size === value.length
    );
  };

  // 入力完了時の処理
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // 数字のみ許可し、1文字に制限
    if (/^\d?$/.test(value)) {
      const newGuess = [...guess]; // 現在の状態をコピー
      newGuess[index] = value; // 入力値を更新
      setGuess(newGuess);

      if (!isValidGuess(newGuess)) {
        setError("3桁の数字はすべて異なる必要があります");
      } else {
        setError("");
      }
    }
  };

  // サーバーにリクエストを送信して結果を取得する関数
  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: guess.join("") }), // string[] を文字列に変換して送信
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
      if (data.feedback.hits === 3) {
        setIsWinner(true);
      }
    } else {
      setMessage(data.message);
    }

    setGuess(["", "", ""]); // 入力後にリセット
  };

  const handleExit = () => {
    router.push("/");
  };

  return (
    <Box p={4} bg="gray.800" color="gray.50" minH="100vh" textAlign="center">
      <VStack gap={4}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.300">
          Single Player - Mastermind
        </Text>
        <Field invalid={!!error} errorText={error}>
          <Stack direction="row" justify="center" gap={2}>
            {guess.map((digit, index) => (
              <Input
                key={index}
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="0"
                maxLength={1} // 1桁のみ許可
                type="text"
                textAlign="center"
                fontSize="lg"
                width="40px"
              />
            ))}
          </Stack>
        </Field>
        <Button
          onClick={handleGuess}
          variant="solid"
          colorScheme="brand"
          disabled={guess.some((digit) => digit === "") || !!error} // 入力の空チェック
        >
          Submit Guess
        </Button>

        <Box mt={4} overflowY="auto" maxH="300px" width="100%">
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

        {message && (
          <Text mt={4} color="gray.300">
            {message}
          </Text>
        )}

        <Button mt={6} colorScheme="red" onClick={handleExit}>
          退室する
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
              <DialogTitle>おめでとうございます！</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text>あなたが勝ちました！</Text>
            </DialogBody>
            <DialogFooter>
              <Button colorScheme="blue" onClick={handleExit}>
                ホームに戻る
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Box>
  );
}
