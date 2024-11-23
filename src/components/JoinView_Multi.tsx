"use client";

import {
  VStack,
  Input,
  Button,
  Stack,
  Box,
  InputAddon,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import BackButton from "./BackButton";

interface JoinViewMultiProps {
  inputRoomId: string;
  userCode: string; // userCode を string 型に
  error: string;
  isJoinDisabled: boolean;
  onInputRoomIdChange: (value: string) => void;
  onPinChange: (value: string) => void; // onPinChange を使用
  onPinComplete: (value: string) => void; // 完了時の値を受け取る
  onJoinRoom: () => void;
}

export default function JoinView_Multi({
  inputRoomId,
  userCode,
  error,
  isJoinDisabled,
  onInputRoomIdChange,
  onPinChange,
  onPinComplete,
  onJoinRoom,
}: JoinViewMultiProps) {
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
    <VStack gap={4} width="100%">
      {/* Room ID Input */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        maxWidth="600px"
        mx="auto"
      >
        <Stack
          direction="row"
          gap={0}
          align="center"
          borderWidth="1px"
          borderColor="gray.600"
          borderRadius="md"
          bg="gray.700"
          overflow="hidden"
          width="100%"
        >
          <InputAddon bg="gray.600" color="white" fontWeight="bold">
            Room ID:
          </InputAddon>
          <Input
            placeholder="Enter Room ID"
            value={inputRoomId}
            onChange={(e) => onInputRoomIdChange(e.target.value)}
            border="none"
            bg="gray.700"
            color="gray.300"
            flex="1"
            focusRing="none"
          />
        </Stack>
      </Box>

      {/* User Code Input */}
      {/* <Text fontWeight="bold">Enter your 3-digit code:</Text> */}
      <Box display="flex" justifyContent="center">
        <Field label="Enter your code" errorText={error} invalid={!!error}>
          <Stack direction="row" justify="center" gap={2}>
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
          </Stack>
        </Field>
      </Box>

      {/* Join Room Button */}
      <Button
        colorScheme="green"
        onClick={onJoinRoom}
        disabled={isJoinDisabled}
      >
        Join Room
      </Button>

      {/* Back Button */}
      <BackButton label="Back" />
    </VStack>
  );
}
