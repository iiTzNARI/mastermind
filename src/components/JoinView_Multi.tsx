import {
  VStack,
  FormControl,
  Input,
  FormLabel,
  FormErrorMessage,
  HStack,
  PinInput,
  PinInputField,
  Button,
} from "@chakra-ui/react";

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

interface JoinViewMultiProps {
  inputRoomId: string;
  userCode: string;
  error: string;
  isJoinDisabled: boolean;
  onInputRoomIdChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onPinComplete: (value: string) => void;
  onJoinRoom: () => void;
  onBackToInitial: () => void;
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
  onBackToInitial,
}: JoinViewMultiProps) {
  return (
    <VStack spacing={4}>
      <FormControl position="relative">
        <Input
          placeholder=" "
          value={inputRoomId}
          onChange={(e) => onInputRoomIdChange(e.target.value)}
          _placeholder={{ color: "transparent" }}
        />
        <FormLabel sx={floatingLabelStyles}>Room ID</FormLabel>
      </FormControl>
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
        colorScheme="green"
        onClick={onJoinRoom}
        isDisabled={isJoinDisabled}
      >
        Join Room
      </Button>
      <Button colorScheme="gray" variant="outline" onClick={onBackToInitial}>
        Back to Initial
      </Button>
    </VStack>
  );
}
