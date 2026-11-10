/** ["HH","MM","SS"] left until `endsAtMs`; hours run past 24; zeros once over. */
export function countdownParts(endsAtMs: number, nowMs: number): string[] {
  const left = Math.max(0, Math.floor((endsAtMs - nowMs) / 1000));
  const two = (n: number) => String(n).padStart(2, "0");
  return [two(Math.floor(left / 3600)), two(Math.floor(left / 60) % 60), two(left % 60)];
}
