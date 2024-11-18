import { VStack, Text, Button } from "@chakra-ui/react";

interface FullViewMultiProps {
  onBackToInitial: () => void;
}

export default function FullView_Multi({
  onBackToInitial,
}: FullViewMultiProps) {
  return (
    <VStack spacing={4} textAlign="center">
      <Text color="red.500">This room is full. Please try another room.</Text>
      <Button colorScheme="blue" onClick={onBackToInitial}>
        Back to Home
      </Button>
    </VStack>
  );
}
