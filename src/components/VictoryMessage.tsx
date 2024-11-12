// src/components/VictoryMessage.tsx
import { useRouter } from "next/navigation";

export default function VictoryMessage() {
  const router = useRouter();

  return (
    <div>
      <p>おめでとうございます！あなたが勝ちました！</p>
      <button
        onClick={() => router.push("/")}
        className="bg-green-500 text-white px-4 py-2 mt-2"
      >
        ホームに戻る
      </button>
    </div>
  );
}
