import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function MultiplayerLobby({
  onJoinRoom,
}: {
  onJoinRoom: (roomId: string) => void;
}) {
  const [roomCode, setRoomCode] = useState("");

  const createRoom = async () => {
    const code = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0"); // 3桁のランダムコード
    const roomRef = await addDoc(collection(db, "rooms"), {
      code,
      createdAt: new Date(),
      players: [],
    });
    onJoinRoom(roomRef.id);
  };

  const joinRoom = () => {
    if (roomCode) {
      onJoinRoom(roomCode);
    }
  };

  return (
    <div>
      <button
        onClick={createRoom}
        className="bg-green-500 text-white px-4 py-2 mt-2"
      >
        Create Room
      </button>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Room ID"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={joinRoom}
          className="bg-blue-500 text-white px-4 py-2 ml-2"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
