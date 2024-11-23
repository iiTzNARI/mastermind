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
import CopyButton from "@/components/CopyButton";

interface CreateViewProps {
  roomId: string | null;
  userCode: string;
  error: string;
  onPinChange: (value: string) => void;
  onPinComplete: (value: string) => void;
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
    <VStack gap={4} width="100%">
      {/* Room ID Field */}
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
          width="fit"
        >
          <InputAddon bg="gray.600" color="white" fontWeight="bold">
            Room ID:
          </InputAddon>
          <Input
            value={roomId || ""}
            readOnly
            border="none"
            bg="gray.700"
            color="gray.300"
            flex="1"
            focusRing="none"
          />
          <Box>
            <CopyButton value={roomId || ""} />
          </Box>
        </Stack>
      </Box>

      {/* User Code Input */}
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
