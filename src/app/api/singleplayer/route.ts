import { NextResponse } from "next/server";
import { generateCode } from "../../../utils/generateCode";
import { calculateFeedback } from "../../../utils/calculateFeedback";

let secretCode = generateCode(); // ランダムなコードを生成

export async function POST(request: Request) {
  const { guess } = await request.json();

  if (!guess || guess.length !== 3) {
    return NextResponse.json(
      { message: "Guess must be a 3-digit number" },
      { status: 400 }
    );
  }

  const feedback = calculateFeedback(guess, secretCode);

  if (feedback.hits === 3) {
    secretCode = generateCode(); // 正解された場合、新しいコードを生成
    return NextResponse.json({ message: "You won!", feedback });
  }

  return NextResponse.json({ feedback });
}
