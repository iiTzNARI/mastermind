import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { calculateFeedback } from "../utils/calculateFeedback";

export default function GameBoard({ roomId }: { roomId: string }) {
  const [guess, setGuess] = useState("");
  const [feedbacks, setFeedbacks] = useState<
    { guess: string; hits: number; blows: number }[]
  >([]);
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    getDoc(roomRef).then((doc) => {
      if (doc.exists()) {
        setRoomCode(doc.data().code);
      }
    });

    const feedbacksRef = collection(roomRef, "feedbacks");
    const unsubscribe = onSnapshot(feedbacksRef, (snapshot) => {
      setFeedbacks(
        snapshot.docs.map(
          (doc) => doc.data() as { guess: string; hits: number; blows: number }
        )
      );
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleGuess = async () => {
    const feedback = calculateFeedback(guess, roomCode);
    const feedbacksRef = collection(doc(db, "rooms", roomId), "feedbacks");
    await addDoc(feedbacksRef, { guess, ...feedback });
    setGuess("");
  };

  return (
    <div>
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
