"use client";
import { useState } from "react";

export default function Singleplayer() {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<{
    hits: number;
    blows: number;
  } | null>(null);
  const [message, setMessage] = useState("");

  const handleGuess = async () => {
    const response = await fetch("/api/singleplayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess }),
    });
    const data = await response.json();

    if (data.feedback) {
      setFeedback(data.feedback);
      setMessage(data.message || "");
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Single Player - Mastermind</h1>
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
      {feedback && (
        <div className="mt-4">
          <p>Hits: {feedback.hits}</p>
          <p>Blows: {feedback.blows}</p>
        </div>
      )}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
