"use client";

import { Text, Button } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResultMultiModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWinner: boolean;
}

export default function ResultMultiModal({
  isOpen,
  onClose,
  isWinner,
}: ResultMultiModalProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isWinner ? "Victory!" : "Defeat"}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {isWinner
              ? "Congratulations! You won the game!"
              : "You lost. Better luck next time!"}
          </Text>
        </DialogBody>
        <DialogFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
