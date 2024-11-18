"use client";

import { Button, VStack } from "@chakra-ui/react";
import BackButton from "./BackButton";

interface InitialViewProps {
  onCreateRoom: () => void; // Create Roomボタンのクリックハンドラ
  onJoinRoom: () => void; // Join Roomボタンのクリックハンドラ
  onBackToHome: () => void; // Back to Homeボタンのクリックハンドラ
}

export default function InitialView_Multi({
  onCreateRoom,
  onJoinRoom,
}: InitialViewProps) {
  return (
    <VStack spacing={4}>
      <Button colorScheme="blue" onClick={onCreateRoom}>
        Create Room
      </Button>
      <Button colorScheme="green" onClick={onJoinRoom}>
        Join Room
      </Button>
      <BackButton label="Back" />
    </VStack>
  );
}
