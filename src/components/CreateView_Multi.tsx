"use client";

import {
  VStack,
  FormControl,
  InputGroup,
  Input,
  FormLabel,
  InputRightElement,
  Text,
  Button,
  HStack,
  PinInput,
  PinInputField,
  FormErrorMessage,
} from "@chakra-ui/react";
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

const floatingLabelStyles = {
  position: "absolute" as const,
  top: "-8px",
  left: "10px",
  backgroundColor: "gray.800",
  paddingX: "1",
  fontSize: "sm",
  color: "gray.500",
  transition: "0.2s ease",
};

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
  return (
    <VStack spacing={4} maxWidth="sm" width="100%">
      <FormControl position="relative">
        <InputGroup size="md">
          <Input
            placeholder=" "
            value={roomId || ""}
            isReadOnly
            _placeholder={{ color: "transparent" }}
          />
          <FormLabel sx={floatingLabelStyles}>Room ID</FormLabel>
          <InputRightElement width="4.5rem" pr="1">
            <CopyButton value={roomId || ""} />
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Text>Enter your 3-digit code:</Text>
      <FormControl isInvalid={!!error}>
        <HStack spacing={2} justify="center">
          <PinInput
            size="lg"
            type="number"
            value={userCode}
            onChange={onPinChange}
            onComplete={onPinComplete}
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
      <Button
        colorScheme="blue"
        onClick={onGameStart}
        isDisabled={isGameStartDisabled}
      >
        Game Start
      </Button>
      <Button variant="outline" onClick={onBackToInitial} mt={2}>
        Back
      </Button>
    </VStack>
  );
}
