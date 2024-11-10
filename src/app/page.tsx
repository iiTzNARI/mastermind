import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mastermind Game</h1>
      <p className="mt-4">Choose a game mode:</p>
      <div className="mt-4">
        <Link
          href="/singleplayer"
          className="bg-blue-500 text-white px-4 py-2 mr-4"
        >
          Single Player
        </Link>
        <Link href="/multiplayer" className="bg-green-500 text-white px-4 py-2">
          Multiplayer
        </Link>
      </div>
    </div>
  );
}
