"use client";
import { useState } from "react";
import MultiplayerLobby from "../../components/MultiplayerLobby";
import GameBoard from "../../components/GameBoard";

export default function Multiplayer() {
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleJoinRoom = (id: string) => {
    setRoomId(id);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Multiplayer - Mastermind</h1>
      {roomId ? (
        <GameBoard roomId={roomId} />
      ) : (
        <MultiplayerLobby onJoinRoom={handleJoinRoom} />
      )}
    </div>
  );
}
