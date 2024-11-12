// src/components/ExitButton.tsx
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useRouter } from "next/navigation";

interface ExitButtonProps {
  roomId: string;
  unsubscribeRef: React.MutableRefObject<(() => void) | null>;
}

export default function ExitButton({
  roomId,
  unsubscribeRef,
}: ExitButtonProps) {
  const router = useRouter();

  const leaveRoom = async () => {
    const roomRef = doc(db, "rooms", roomId);
    try {
      // Firestoreの購読を解除
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null; // refをリセット
      }

      // isRoomActive を false に設定してからルームを削除
      await updateDoc(roomRef, { isRoomActive: false });
      await deleteDoc(roomRef);
      router.push("/"); // ホーム画面に遷移
    } catch (error) {
      console.error("Error leaving room:", error);
      alert("Failed to leave room.");
    }
  };

  return (
    <button
      onClick={leaveRoom}
      className="bg-red-500 text-white px-4 py-2 mt-4"
    >
      退室する
    </button>
  );
}
