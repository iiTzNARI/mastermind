// src/components/NumberInputForm.tsx
import { Input, Button, VStack, Stack, Box } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

interface NumberInputFormProps {
  guess: string;
  error: string;
  isMyTurn: boolean;
  onInputChange: (value: string) => void;
  onComplete: (value: string) => void; // onComplete を追加
  onSubmit: () => void;
}

export default function NumberInputForm({
  guess,
  error,
  isMyTurn,
  onInputChange,
  onComplete, // 追加
  onSubmit,
}: NumberInputFormProps) {
  // 1文字ずつ更新する関数
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

      // 入力が3桁揃ったら onComplete を呼び出す
      if (updatedGuess.length === 3) {
        onComplete(updatedGuess);
      }
    }
  };

  return (
    <VStack gap={4} width="100%" maxW="sm">
      {/* Field コンポーネントでエラーメッセージを表示 */}
      <Box display="flex" justifyContent="center">
        <Field invalid={!!error} errorText={error} label="Enter your guess">
          <Stack direction="row" justify="center" gap={2}>
            {/* 3つの入力フィールドを動的にレンダリング */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Input
                key={index}
                value={guess[index] || ""}
                onChange={(e) => handleInputChange(e, index)}
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
        Submit Guess
      </Button>
    </VStack>
  );
}
