// src/components/GameBoard.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "../utils/firebase";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";
import { v4 as uuidv4 } from "uuid";
import ExitButton from "./ExitButton";
import VictoryMessage from "./VictoryMessage";

interface GameBoardProps {
  roomId: string;
  userCode: string | null;
}

export default function GameBoard({ roomId, userCode }: GameBoardProps) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [opponentCode, setOpponentCode] = useState(""); // 相手の数字
  const [isWaiting, setIsWaiting] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [isLoser, setIsLoser] = useState(false);
  const [playerId] = useState(uuidv4());
  const joinRoomCalled = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const joinRoom = async () => {
      if (joinRoomCalled.current) return;

      const roomSnapshot = await getDoc(roomRef);
      if (!roomSnapshot.exists()) {
        alert("Room does not exist!");
        return;
      }

      const data = roomSnapshot.data();
      const players = data.players || [];
      const playerKey = players.length === 0 ? "player1" : "player2";

      // 自分の3桁の数字を部屋のデータに追加
      if (playerKey === "player2" && data.playerCodes) {
        await updateDoc(roomRef, { "playerCodes.player2": userCode });
      } else if (playerKey === "player1" && data.playerCodes) {
        await updateDoc(roomRef, { "playerCodes.player1": userCode });
      }

      setOpponentCode(
        playerKey === "player1"
          ? data.playerCodes.player2
          : data.playerCodes.player1
      );

      players.push(playerId);
      await updateDoc(roomRef, { playerCount: players.length, players });
      joinRoomCalled.current = true;
    };

    if (!joinRoomCalled.current) joinRoom();

    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        // 勝敗が決まっている場合は、相手が退出してもアラートを表示しない
        if ((isWinner || isLoser) && data.isRoomActive === false) {
          router.push("/"); // ホーム画面に戻る
          return;
        }

        // ルームが非アクティブの場合に通知して退室
        if (data.isRoomActive === false && !isWinner && !isLoser) {
          const remainingPlayers = data.players || [];
          if (!remainingPlayers.includes(playerId)) {
            // 自分が退出した場合：ホーム画面に遷移（アラートなし）
            router.push("/");
          } else {
            // 相手が退出した場合：アラート表示後にホーム画面に遷移
            alert("相手が退出しました");
            router.push("/");
          }
          return; // 以降の処理をスキップ
        }

        // 相手がいない状態を設定
        setIsWaiting(data.playerCount < 2);

        const playerKey = data.players[0] === playerId ? "player1" : "player2";
        setOpponentCode(
          playerKey === "player1"
            ? data.playerCodes.player2
            : data.playerCodes.player1
        );

        if (data.winner) {
          setIsWinner(data.winner === playerId);
          setIsLoser(data.winner !== playerId);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, userCode, isWinner, isLoser]);

  const handleWin = async () => {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, { winner: playerId });
  };

  const handleGuess = async () => {
    if (isWaiting || isWinner || isLoser) return;

    const feedback = calculateFeedback(guess, opponentCode);
    setFeedbacks([
      ...feedbacks,
      { guess, hits: feedback.hits, blows: feedback.blows },
    ]);
    setGuess("");

    if (feedback.hits === 3) handleWin();
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
      <ExitButton roomId={roomId} playerId={playerId} /> {/* playerIdを渡す */}
    </div>
  );
}
