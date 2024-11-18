import {
  FormControl,
  FormErrorMessage,
  HStack,
  PinInput,
  PinInputField,
  Button,
} from "@chakra-ui/react";

interface NumberInputFormProps {
  guess: string;
  error: string;
  isMyTurn: boolean;
  onPinChange: (value: string) => void;
  onComplete: (value: string) => void;
  onSubmit: () => void;
}

export default function NumberInputForm({
  guess,
  error,
  isMyTurn,
  onPinChange,
  onComplete,
  onSubmit,
}: NumberInputFormProps) {
  return (
    <>
      <FormControl isInvalid={!!error}>
        <HStack justify="center">
          <PinInput
            value={guess}
            onChange={onPinChange}
            onComplete={onComplete}
            size="lg"
            type="number"
            isDisabled={!isMyTurn}
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>

      <Button
        onClick={onSubmit}
        variant="solid"
        colorScheme="brand"
        isDisabled={!isMyTurn || !!error || guess.length !== 3}
      >
        Submit Guess
      </Button>
    </>
  );
}
