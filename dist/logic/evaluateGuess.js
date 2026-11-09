export const evaluateGuess = (secret, guess) => {
    const secretDigits = secret.toLowerCase().split('');
    const guessDigits = guess.toLowerCase().split('');
    const bulls = guessDigits.reduce((count, digit, i) => (digit === secretDigits[i] ? count + 1 : count), 0);
    const nonBullSecret = secretDigits.filter((digit, i) => digit !== guessDigits[i]);
    const nonBullGuess = guessDigits.filter((digit, i) => digit !== secretDigits[i]);
    const secretRemainingSet = new Set(nonBullSecret);
    const cows = nonBullGuess.filter((digit) => secretRemainingSet.has(digit)).length;
    return { bulls, cows };
};
//# sourceMappingURL=evaluateGuess.js.map