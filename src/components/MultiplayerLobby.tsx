import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function MultiplayerLobby({
  onJoinRoom,
}: {
  onJoinRoom: (roomId: string) => void;
}) {
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const createRoom = async () => {
    try {
      const code = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0"); // 3桁のランダムコード
      const roomRef = await addDoc(collection(db, "rooms"), {
        code,
        createdAt: new Date(),
        playerCount: 0, // 初期状態として 0 に設定
        players: [], // 初期プレイヤーリストを空にする
      });

      console.log("Room created with ID:", roomRef.id);
      setCreatedRoomId(roomRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check console for details.");
    }
  };

  const joinRoom = () => {
    if (roomCode) {
      onJoinRoom(roomCode);
    }
  };

  const handleJoinRoom = () => {
    if (createdRoomId) {
      onJoinRoom(createdRoomId);
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

      {createdRoomId ? (
        <div className="mt-4">
          <p>
            Room Created! ID: <span className="font-bold">{createdRoomId}</span>
          </p>
          <p>Share this ID with others to join the room.</p>
          <button
            onClick={handleJoinRoom}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Go to Room
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter Room ID to join"
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
