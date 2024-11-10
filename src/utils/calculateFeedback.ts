export function calculateFeedback(guess: string, code: string) {
  let hits = 0;
  let blows = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === code[i]) {
      hits++;
    } else if (code.includes(guess[i])) {
      blows++;
    }
  }

  return { hits, blows };
}
