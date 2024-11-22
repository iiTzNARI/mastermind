"use client";

import { VStack, Input, Text, Button, HStack, Stack } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import CopyButton from "@/components/CopyButton";

interface CreateViewProps {
  roomId: string | null;
  userCode: string; // string 型
  error: string;
  onPinChange: (value: string) => void; // 値を渡す関数
  onPinComplete: (value: string) => void; // 完了時に値を渡す関数
  onGameStart: () => void;
  onBackToInitial: () => void;
  isGameStartDisabled: boolean;
}

export default function CreateView_Multi({
  roomId,
  userCode,
  error,
  onPinChange,
  onPinComplete,
  onGameStart,
  onBackToInitial,
  isGameStartDisabled,
}: CreateViewProps) {
  const handleDigitChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const updatedCode =
        userCode.substring(0, index) + value + userCode.substring(index + 1);
      onPinChange(updatedCode);

      if (updatedCode.length === 3) {
        onPinComplete(updatedCode);
      }
    }
  };

  return (
    <VStack gap={4} maxWidth="sm" width="100%">
      {/* Room ID Field */}
      <Field label="Room ID" position="relative">
        <Stack direction="row" align="center" gap={2}>
          <Input
            placeholder=" "
            value={roomId || ""}
            readOnly
            _placeholder={{ color: "transparent" }}
            bg="gray.700"
            borderColor="gray.600"
            color="gray.300"
          />
          <CopyButton value={roomId || ""} />
        </Stack>
      </Field>

      {/* User Code Input */}
      <Text fontWeight="bold">Enter your 3-digit code:</Text>
      <Field label="Enter your code" errorText={error} invalid={!!error}>
        <HStack gap={2} justify="center">
          {Array.from({ length: 3 }).map((_, index) => (
            <Input
              key={index}
              value={userCode[index] || ""}
              onChange={(e) => handleDigitChange(e.target.value, index)}
              maxLength={1}
              textAlign="center"
              fontSize="lg"
              width="40px"
              type="text"
              placeholder="0"
              bg="gray.700"
              borderColor="gray.600"
              color="white"
            />
          ))}
        </HStack>
      </Field>

      {/* Buttons */}
      <Button
        colorScheme="blue"
        onClick={onGameStart}
        disabled={isGameStartDisabled}
      >
        Game Start
      </Button>
      <Button variant="outline" onClick={onBackToInitial} mt={2}>
        Back
      </Button>
    </VStack>
  );
}
