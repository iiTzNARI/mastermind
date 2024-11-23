// src/components/NumberInputForm.tsx
import { Input, Button, VStack, Stack, Box } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useRef } from "react";

interface NumberInputFormProps {
  guess: string;
  error: string;
  label: string;
  isMyTurn: boolean;
  onInputChange: (value: string) => void;
  onComplete: (value: string) => void;
  onSubmit: () => void;
}

export default function NumberInputForm({
  guess,
  error,
  isMyTurn,
  label,
  onInputChange,
  onComplete,
  onSubmit,
}: NumberInputFormProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (/^\d?$/.test(value)) {
      const newGuess = guess.split("");
      newGuess[index] = value;
      const updatedGuess = newGuess.join("");
      onInputChange(updatedGuess);

      if (value && index < 2) {
        inputRefs.current[index + 1]?.focus();
      }

      if (updatedGuess.length === 3) {
        onComplete(updatedGuess);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !guess[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <VStack gap={4} width="100%" maxW="sm">
      <Box display="flex" justifyContent="center">
        <Field
          invalid={!!error}
          errorText={error}
          label="Enter your guess"
          alignItems="center"
        >
          <Stack direction="row" justify="center" gap={2}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Input
                key={index}
                ref={(e) => {
                  inputRefs.current[index] = e;
                }}
                value={guess[index] || ""}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                type="text"
                textAlign="center"
                fontSize="lg"
                width="40px"
                disabled={!isMyTurn}
                placeholder="0"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
              />
            ))}
          </Stack>
        </Field>
      </Box>

      {/* ボタン */}
      <Button
        onClick={onSubmit}
        variant="solid"
        colorScheme="brand"
        disabled={!isMyTurn || !!error || guess.length !== 3}
      >
        {/* Submit Guess */}
        {label}
      </Button>
    </VStack>
  );
}
