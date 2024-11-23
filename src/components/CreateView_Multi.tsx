"use client";

import {
  VStack,
  Input,
  Button,
  Stack,
  Box,
  InputAddon,
} from "@chakra-ui/react";
import CopyButton from "@/components/CopyButton";
import NumberInputForm from "./NumberInputForm";

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
}: CreateViewProps) {
  const handleComplete = (value: string) => {
    onPinComplete(value);
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
      <NumberInputForm
        guess={userCode}
        error={error}
        label="Game Start"
        isMyTurn={true}
        onInputChange={onPinChange}
        onComplete={handleComplete}
        onSubmit={onGameStart}
      />
      <Button variant="outline" onClick={onBackToInitial} mt={2}>
        Back
      </Button>
    </VStack>
  );
}
