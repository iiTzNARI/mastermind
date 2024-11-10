export function generateCode(): string {
  const digits = new Set<number>();
  while (digits.size < 3) {
    digits.add(Math.floor(Math.random() * 10));
  }
  return Array.from(digits).join("");
}
