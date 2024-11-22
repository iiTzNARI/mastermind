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

interface OpponentExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpponentExitModal({
  isOpen,
  onClose,
}: OpponentExitModalProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opponent Left</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>The other player has exited the game.</Text>
        </DialogBody>
        <DialogFooter>
          <Button colorScheme="red" onClick={onClose}>
            Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
