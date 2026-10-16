/** Space prose alternatives without touching numeric ratios or single-letter formulas. */
export function readableEffect(text: string): string {
  return text.replace(/([A-Za-z][A-Za-z0-9-]+\]?)\/(?=\[?[A-Za-z][A-Za-z0-9-]+)/g, '$1 / ')
    .replace(/\b(Skill [12]\]?)\/(?=\[?Skill [12]\b)/g, '$1 / ');
}
