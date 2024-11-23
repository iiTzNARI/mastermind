"use client";

import {
  VStack,
  Input,
  // Button,
  Stack,
  Box,
  InputAddon,
} from "@chakra-ui/react";
import BackButton from "./BackButton";
import NumberInputForm from "./NumberInputForm";

interface JoinViewMultiProps {
  inputRoomId: string;
  userCode: string;
  error: string;
  isJoinDisabled: boolean;
  onInputRoomIdChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onPinComplete: (value: string) => void;
  onJoinRoom: () => void;
}

export default function JoinView_Multi({
  inputRoomId,
  userCode,
  error,
  onInputRoomIdChange,
  onPinChange,
  onPinComplete,
  onJoinRoom,
}: JoinViewMultiProps) {
  const handleComplete = (value: string) => {
    onPinComplete(value);
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
      <NumberInputForm
        guess={userCode}
        error={error}
        labelForMessage="Enter you 3 digit code."
        labelForButton="Join Room"
        isMyTurn={true}
        onInputChange={onPinChange}
        onComplete={handleComplete}
        onSubmit={onJoinRoom}
      />

      {/* Back Button */}
      <BackButton label="Back" />
    </VStack>
  );
}
