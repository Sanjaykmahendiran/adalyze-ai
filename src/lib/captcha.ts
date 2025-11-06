// src/lib/captcha.ts
export const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomText(length = 5) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";

  // Ensure at least 3 letters and 2 numbers
  const requiredLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length)));
  const requiredNumbers = Array.from({ length: 2 }, () => numbers.charAt(Math.floor(Math.random() * numbers.length)));

  // Combine and shuffle
  const allChars = [...requiredLetters, ...requiredNumbers];
  
  // Shuffle using Fisher–Yates algorithm
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join("");
}
