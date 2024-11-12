// src/components/MultiplayerLobby.tsx
import { useState } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function MultiplayerLobby({
  onJoinRoom,
}: {
  onJoinRoom: (roomId: string, code: string) => void; // codeを引数に追加
}) {
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState(""); // プレイヤーの3桁の数字
  const [error, setError] = useState<string | null>(null);

  // 3桁の数字が異なるかを確認する関数
  const isUniqueDigits = (num: string) => {
    return new Set(num).size === num.length;
  };

  const createRoom = async () => {
    try {
      if (userCode.length !== 3 || !isUniqueDigits(userCode)) {
        setError("3桁の数字を入力し、すべての桁を異なるようにしてください。");
        return;
      }
      setError(null);

      const roomRef = await addDoc(collection(db, "rooms"), {
        playerCodes: { player1: userCode, player2: "" },
        createdAt: new Date(),
        playerCount: 1,
        players: [],
      });

      setCreatedRoomId(roomRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check console for details.");
    }
  };

  const handleJoinRoom = () => {
    if (createdRoomId) {
      onJoinRoom(createdRoomId, userCode); // userCodeを渡す
    }
  };

  return (
    <div>
      <input
        type="text"
        maxLength={3}
        value={userCode}
        onChange={(e) => setUserCode(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="3桁の数字"
        className="border p-2 mt-4"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={createRoom}
        className="bg-green-500 text-white px-4 py-2 mt-2"
      >
        Create Room
      </button>

      {createdRoomId && (
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
      )}

      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter Room ID to join"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={() => onJoinRoom(roomCode, userCode)} // userCodeを渡す
          className="bg-blue-500 text-white px-4 py-2 ml-2"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
