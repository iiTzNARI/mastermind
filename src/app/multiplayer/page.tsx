"use client";
import { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { calculateFeedback } from "../../utils/calculateFeedback"; // 追加

export default function Multiplayer() {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);

  const handleGuess = async () => {
    const feedback = calculateFeedback(guess, "123"); // 実際はサーバーからコードを取得
    await addDoc(collection(db, "guesses"), { guess, ...feedback });
    setGuess("");
  };

  useEffect(() => {
    const q = query(collection(db, "guesses"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(
        snapshot.docs.map(
          (doc) => doc.data() as { guess: string; hits: number; blows: number }
        )
      );
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Multiplayer - Mastermind</h1>
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
    </div>
  );
}
