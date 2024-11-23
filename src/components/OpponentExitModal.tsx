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
import { db } from "../utils/firebase";
import { doc, updateDoc, getDoc, arrayRemove } from "firebase/firestore";
import { safeDeleteRoom } from "@/utils/safeDeleteRoom";

interface OpponentExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  playerId: string;
}

export default function OpponentExitModal({
  isOpen,
  onClose,
  roomId,
  playerId,
}: OpponentExitModalProps) {
  const handleExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    try {
      const roomSnapshot = await getDoc(roomRef);
      if (!roomSnapshot.exists()) {
        console.error("Room does not exist!");
        onClose();
        return;
      }

      const data = roomSnapshot.data();
      const currentCount = data?.playerCount || 0;

      await updateDoc(roomRef, {
        players: arrayRemove(playerId),
        playerCount: currentCount - 1,
      });

      const updatedSnapshot = await getDoc(roomRef);
      const updatedData = updatedSnapshot.data();
      console.log(updatedData);

      if (updatedData?.playerCount <= 0) {
        safeDeleteRoom(roomId);
      }
    } catch (error) {
      console.error("Error during opponent exit handling:", error);
    } finally {
      onClose();
    }
  };

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
          <Button colorScheme="red" onClick={handleExit}>
            Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
