export async function shareScore(score: number, won: boolean): Promise<'shared' | 'copied' | 'failed'> {
  const text = won
    ? `Scoundrel - I scored ${score} and conquered the dungeon! Can you survive?`
    : `Scoundrel - The dungeon defeated me with a score of ${score}. Can you do better?`;

  const url = window.location.origin;
  const fullText = `${text}\n${url}`;

  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Scoundrel', text, url });
      return 'shared';
    } catch {
      // User cancelled or share failed, fall through to clipboard
    }
  }

  // Fall back to clipboard
  try {
    await navigator.clipboard.writeText(fullText);
    return 'copied';
  } catch {
    return 'failed';
  }
}
