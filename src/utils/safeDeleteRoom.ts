import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export const safeDeleteRoom = async (roomId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  try {
    const roomSnapshot = await getDoc(roomRef);
    if (roomSnapshot.exists()) {
      await deleteDoc(roomRef);
    } else {
      console.warn("Room does not exist, skipping deletion.");
    }
  } catch (error) {
    console.error("Failed to delete room:", error);
  }
};
