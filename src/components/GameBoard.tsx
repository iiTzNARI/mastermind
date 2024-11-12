// src/components/GameBoard.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import {
  doc,
  onSnapshot,
  writeBatch,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
import { v4 as uuidv4 } from "uuid";
import ExitButton from "./ExitButton";
import VictoryMessage from "./VictoryMessage";

interface GameBoardProps {
  roomId: string;
}

export default function GameBoard({ roomId }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [roomCode, setRoomCode] = useState("");
  const [isWaiting, setIsWaiting] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [playerId] = useState(uuidv4());
  const joinRoomCalled = useRef(false);
  const router = useRouter();

  // Firestore購読解除用のref
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const joinRoom = async () => {
      try {
        if (joinRoomCalled.current) return;

        const roomSnapshot = await getDoc(roomRef);
        if (!roomSnapshot.exists()) {
          alert("Room does not exist!");
          return;
        }

        const data = roomSnapshot.data();
        const players = data.players || [];

        if (players.includes(playerId)) {
          joinRoomCalled.current = true;
          return;
        }

        const batch = writeBatch(db);
        players.push(playerId);
        batch.update(roomRef, {
          playerCount: data.playerCount + 1,
          players,
          isRoomActive: true, // ルームがアクティブであることを示す
        });

        await batch.commit();
        joinRoomCalled.current = true;
      } catch (error) {
        console.error("Error updating player count:", error);
        alert("Failed to join room. The room may already be full.");
      }
    };

    if (!joinRoomCalled.current) {
      joinRoom();
    }

    // Firestoreのリアルタイム購読を設定
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRoomCode(data.code || "");

        // プレイヤーが2人揃った場合、待機状態を解除
        setIsWaiting(data.playerCount < 2);

        // 勝利者がいる場合に勝敗メッセージを表示
        if (data.winner) {
          if (data.winner === playerId) {
            setIsWinner(true); // 自分が勝者
          } else {
            setIsLoser(true); // 相手が勝者なので自分は敗者
          }
        }

        // ルームがアクティブでない場合はホームに戻る
        if (data.isRoomActive === false && !isWinner && !isLoser) {
          alert("相手がルームを退出しました。");
          router.push("/");
        }
      }
    });

    // 購読解除関数をrefに保存
    unsubscribeRef.current = unsubscribe;

    return () => {
      // コンポーネントのアンマウント時に購読を解除
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [roomId, playerId]);

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
  };

  const handleGuess = async () => {
    if (isWaiting || isWinner || isLoser) return;

    const feedback = calculateFeedback(guess, roomCode);
    setFeedbacks([
      ...feedbacks,
      { guess, hits: feedback.hits, blows: feedback.blows },
    ]);
    setGuess("");

    if (feedback.hits === 3) {
      handleWin();
    }
  };

  return (
    <div>
      {isWaiting ? (
        <p>他のプレイヤーを待っています...</p>
      ) : isWinner ? (
        <VictoryMessage />
      ) : isLoser ? (
        <p>あなたの負けです。</p>
      ) : (
        <>
          <input
            type="text"
            maxLength={3}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="border p-2 mt-4"
          />
          <button
            onClick={handleGuess}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Submit Guess
          </button>
          <div className="mt-4">
            {feedbacks.map((feedback, index) => (
              <div key={index} className="mt-2">
                <p>Guess: {feedback.guess}</p>
                <p>
                  Hits: {feedback.hits}, Blows: {feedback.blows}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      <ExitButton roomId={roomId} unsubscribeRef={unsubscribeRef} />
    </div>
  );
}
