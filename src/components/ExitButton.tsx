// src/components/ExitButton.tsx
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
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

interface ExitButtonProps {
  roomId: string;
  playerId: string;
  onPlayerExit?: () => void; // プレイヤー退出時のコールバックを追加
}

export default function ExitButton({
  roomId,
  playerId,
  onPlayerExit,
}: ExitButtonProps) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    // ルームデータを取得
    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
      alert("Room does not exist!");
      if (onPlayerExit) onPlayerExit(); // プレイヤー退出コールバックを呼び出す
      router.push("/");
      return;
    }

    const data = roomSnapshot.data();
    const currentCount = data?.playerCount || 0;

    // プレイヤーを削除し、playerCountを更新
    await updateDoc(roomRef, {
      players: arrayRemove(playerId),
      playerCount: currentCount - 1,
    });

    // playerCountを再取得し、0であればルームを削除
    const updatedSnapshot = await getDoc(roomRef);
    const updatedData = updatedSnapshot.data();
    if (updatedData && updatedData.playerCount <= 0) {
      setIsDeleting(true);
      await deleteDoc(roomRef);
      console.log("Room deleted as it has no remaining players.");
    }

    if (onPlayerExit) onPlayerExit(); // プレイヤー退出コールバックを呼び出す

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
      >
        退出する
      </Button>

      {/* 退出確認モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exit Room</ModalHeader>
          <ModalBody>
            <Text>本当に退出しますか？</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleExit}
              ml={3}
              isLoading={isDeleting}
            >
              Exit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
