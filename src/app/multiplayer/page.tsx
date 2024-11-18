"use client";
import { useState, useEffect, useRef } from "react";
import { Box, Heading } from "@chakra-ui/react";
import { db } from "../../utils/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import GameBoard from "../../components/GameBoard";
import InitialView_Multi from "../../components/InitialView_Multi";
import CreateView_Multi from "@/components/CreateView_Multi";
import JoinView_Multi from "@/components/JoinView_Multi";
import WaitingView_Multi from "@/components/WaitingView_Multi";
import FinishGameModal from "@/components/FinishGameModal";
import FullView_Multi from "@/components/FullView_Multi";
import RoomTimeoutModal from "@/components/RoomTimeoutModal";

export default function Multiplayer() {
  const [view, setView] = useState<
    "initial" | "create" | "join" | "waiting" | "game" | "full"
  >("initial");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [playerId] = useState(uuidv4());
  const roomDeletionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);

      // Firestoreのリアルタイムリスナーを設定
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.isRoomDeleted) {
          setShowTimeoutModal(true); // モーダルを表示
        }
      });

      return () => {
        unsubscribe(); // クリーンアップ
      };
    }
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (roomDeletionTimeout.current) {
        clearTimeout(roomDeletionTimeout.current);
      }
    };
  }, []);

  const hasUniqueDigits = (value: string) => {
    return new Set(value).size === value.length;
  };

  const handlePinChange = (value: string) => {
    setUserCode(value);
    if (value.length === 3 && !hasUniqueDigits(value)) {
      setError("3桁の数字はすべて異なる必要があります");
    } else {
      setError("");
    }
  };

  const handlePinComplete = (value: string) => {
    if (!hasUniqueDigits(value)) {
      setError("3桁の数字はすべて異なる必要があります");
    } else {
      setError("");
    }
  };

  const handleCreateRoom = async () => {
    const currentTime = Timestamp.now(); // 現在のサーバー時間
    const timeoutDuration = 3 * 60 * 60; // タイムアウトまでの秒数
    const timeoutTimestamp = new Timestamp(
      currentTime.seconds + timeoutDuration,
      currentTime.nanoseconds
    );

    const roomRef = await addDoc(collection(db, "rooms"), {
      playerCount: 0,
      isRoomActive: false,
      players: [],
      isRoomDeleted: false,
      timeoutTimestamp,
    });

    setRoomId(roomRef.id);
    setView("create");

    // タイムアウトのカウントをサーバーで管理
    setTimeout(async () => {
      try {
        await updateDoc(roomRef, { isRoomDeleted: true });
        await deleteDoc(roomRef); // ルームを削除
        console.log("Room deleted automatically due to inactivity.");
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    }, timeoutDuration * 1000); // タイムアウト時間
  };

  const handleJoinRoom = () => {
    setView("join");
  };

  const handleGameStart = async () => {
    if (roomId) {
      const roomRef = doc(db, "rooms", roomId);

      await runTransaction(db, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef);
        const data = roomSnapshot.data();

        if (!data) return;

        // 既存のプレイヤー数に基づいて、プレイヤーを追加し playerCount を更新
        const updatedPlayerCount = data.playerCount + 1;
        const playerPosition = updatedPlayerCount === 1 ? "player1" : "player2";

        // プレイヤー情報を設定
        transaction.update(roomRef, {
          playerCount: updatedPlayerCount, // プレイヤー数を更新
          [`playerCodes.${playerPosition}`]: userCode,
          players: [...(data.players || []), playerId], // プレイヤーIDを追加
        });

        // 2人目のプレイヤーが「Game Start」を押した時点でターン設定
        if (updatedPlayerCount === 2) {
          const opponentId = data.players[0];
          const randomFirstPlayerId =
            Math.random() < 0.5 ? playerId : opponentId;

          transaction.update(roomRef, {
            isRoomActive: true,
            currentTurn: randomFirstPlayerId, // ランダムに最初のターンを設定
          });
        }
      });

      setView("waiting");

      // プレイヤー数が2人になるまでリアルタイムで監視し、2人揃ったらゲームを開始
      onSnapshot(roomRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.playerCount === 2 && data?.isRoomActive) {
          setView("game");
        }
      });
    }
  };

  const handleRoomJoin = async () => {
    const roomRef = doc(db, "rooms", inputRoomId);
    const roomSnapshot = await getDoc(roomRef);

    if (!roomSnapshot.exists()) {
      alert("Room does not exist!");
      return;
    }

    const data = roomSnapshot.data();
    if (data && data.playerCount >= 2) {
      setView("full");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef);
        const data = roomSnapshot.data();

        if (!data) throw new Error("Room does not exist!");

        const playerPosition = data.playerCount === 1 ? "player2" : "player1";
        const updatedPlayerCount = data.playerCount + 1;

        transaction.update(roomRef, {
          playerCount: updatedPlayerCount,
          [`playerCodes.${playerPosition}`]: userCode,
          players: [...(data.players || []), playerId],
        });

        // プレイヤー数が2人揃った場合にのみターンをランダムに設定
        if (updatedPlayerCount === 2) {
          const opponentId =
            data.players[0] === playerId ? data.players[1] : data.players[0];
          const randomFirstPlayerId =
            Math.random() < 0.5 ? playerId : opponentId;
          transaction.update(roomRef, {
            currentTurn: randomFirstPlayerId,
            isRoomActive: true,
          });
        }
      });

      setRoomId(inputRoomId);
      setView("waiting");

      // プレイヤー数をリアルタイムで監視し、2人揃ったらゲームを開始
      onSnapshot(roomRef, (snapshot) => {
        const updatedData = snapshot.data();
        if (updatedData?.playerCount === 2 && updatedData?.isRoomActive) {
          setView("game");
        }
      });
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred while joining the room.");
    }
  };

  const handleCloseModal = () => {
    setShowDeletionModal(false);
    setView("initial");
  };

  const handleBackToHome = () => {
    setView("initial");
  };

  return (
    <Box p={4} textAlign="center" bg="gray.800" color="gray.50" minH="100vh">
      <Heading as="h1" size="xl" mb={4} color="blue.300">
        Multiplayer - Mastermind
      </Heading>

      {view === "initial" && (
        <InitialView_Multi
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBackToHome={handleBackToHome}
        />
      )}

      {view === "create" && (
        <CreateView_Multi
          roomId={roomId}
          userCode={userCode}
          error={error}
          onPinChange={handlePinChange}
          onPinComplete={handlePinComplete}
          onGameStart={handleGameStart}
          onBackToInitial={handleBackToHome}
          isGameStartDisabled={userCode.length !== 3 || !!error}
        />
      )}

      {view === "join" && (
        <JoinView_Multi
          inputRoomId={inputRoomId}
          userCode={userCode}
          error={error}
          isJoinDisabled={
            inputRoomId.length === 0 || userCode.length !== 3 || !!error
          }
          onInputRoomIdChange={setInputRoomId}
          onPinChange={handlePinChange}
          onPinComplete={handlePinComplete}
          onJoinRoom={handleRoomJoin}
        />
      )}

      {view === "waiting" && (
        <WaitingView_Multi
          roomId={roomId}
          playerId={playerId}
          onExit={handleBackToHome}
        />
      )}

      {view === "game" && roomId && userCode && (
        <GameBoard roomId={roomId} playerId={playerId} />
      )}

      {view === "full" && (
        <FullView_Multi onBackToInitial={() => setView("initial")} />
      )}

      <FinishGameModal isOpen={showDeletionModal} onClose={handleCloseModal} />
      <RoomTimeoutModal isOpen={showTimeoutModal} />
    </Box>
  );
}
