// src/components/ExitButton.tsx
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import { doc, updateDoc, arrayRemove, getDoc } from "firebase/firestore";
import { Button } from "@chakra-ui/react";

interface ExitButtonProps {
  roomId: string;
  playerId: string;
}

export default function ExitButton({ roomId, playerId }: ExitButtonProps) {
  const router = useRouter();

  const handleExit = async () => {
    const roomRef = doc(db, "rooms", roomId);

    // 現在のルームのデータを取得
    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
      alert("Room does not exist!");
      return;
    }

    const data = roomSnapshot.data();
    const currentCount = data.playerCount || 0;

    // プレイヤーを削除し、playerCountを更新
    await updateDoc(roomRef, {
      players: arrayRemove(playerId),
      playerCount: currentCount - 1,
    });

    // 最新のデータを再度取得し、プレイヤーが0人または1人ならルームを非アクティブにする
    const updatedSnapshot = await getDoc(roomRef);
    const updatedData = updatedSnapshot.data();
    if (updatedData && updatedData.playerCount <= 1) {
      await updateDoc(roomRef, { isRoomActive: false });
    }

    router.push("/"); // ホーム画面に戻る
  };

  return (
    <Button
      onClick={handleExit}
      variant="solid"
      colorScheme="brand"
      size="lg"
      borderRadius="md"
      bg="red.500"
      _hover={{ bg: "red.600" }}
      color="white"
      mt={4}
    >
      退出する
    </Button>
  );
}
