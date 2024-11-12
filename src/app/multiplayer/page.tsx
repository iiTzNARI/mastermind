// src/app/multiplayer/page.tsx
"use client";
import { useState } from "react";
import MultiplayerLobby from "../../components/MultiplayerLobby";
import GameBoard from "../../components/GameBoard";

export default function Multiplayer() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null); // userCodeを追加

  const handleJoinRoom = (id: string, code: string) => {
    setRoomId(id);
    setUserCode(code); // userCodeを設定
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Multiplayer - Mastermind</h1>
      {roomId ? (
        <GameBoard roomId={roomId} userCode={userCode} /> // userCodeを渡す
      ) : (
        <MultiplayerLobby onJoinRoom={handleJoinRoom} />
      )}
    </div>
  );
}
