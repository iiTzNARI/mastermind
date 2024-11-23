"use client";

import { Button, Stack } from "@chakra-ui/react";
import BackButton from "./BackButton";

interface InitialViewProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBackToHome: () => void;
}

export default function InitialView_Multi({
  onCreateRoom,
  onJoinRoom,
}: InitialViewProps) {
  return (
    <>
      <Stack direction={{ base: "column", sm: "row" }} gap={4} justify="center">
        <Button colorScheme="blue" onClick={onCreateRoom}>
          Create Room
        </Button>
        <Button colorScheme="green" onClick={onJoinRoom}>
          Join Room
        </Button>
      </Stack>
      <BackButton label="Back" />
    </>
  );
}
