"use client";

import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import {
  doc,
  updateDoc,
  arrayRemove,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  // Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExitButtonProps {
  roomId: string;
  playerId: string;
  onPlayerExit?: () => void;
}

export default function ExitButton({
  roomId,
  playerId,
  onPlayerExit,
}: ExitButtonProps) {
  const router = useRouter();
  const { open, onOpen, onClose } = useDisclosure(); // `isOpen` を `open` に変更
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
      alert("Room does not exist!");
      if (onPlayerExit) onPlayerExit();
      router.push("/");
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
    if (updatedData && updatedData.playerCount <= 0) {
      setIsDeleting(true);
      await deleteDoc(roomRef);
      console.log("Room deleted as it has no remaining players.");
    }

    if (onPlayerExit) onPlayerExit();

    router.push("/");
  };

  return (
    <>
      <Button
        onClick={onOpen}
        variant="solid"
        colorScheme="red"
        size="lg"
        borderRadius="md"
        mt={4}
        bg="red.500"
        _hover={{ bg: "red.600" }}
        _active={{ bg: "red.700" }}
      >
        Leave
      </Button>

      <DialogRoot open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Room</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>Are you sure you want to leave the room?</Text>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleExit}
              ml={3}
              loading={isDeleting} // 修正済み
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
