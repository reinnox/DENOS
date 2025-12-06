export function scheduleNext(card, correct) {
  // SM-2 spaced repetition algorithm (simplified)
  const now = new Date();
  const quality = correct ? 5 : 2; // map binary response to quality

  let repetition = card.repetition || 0; // number of consecutive successes
  let interval = card.interval || 0; // interval in days
  let ef = card.efactor || 2.5; // ease factor

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // update efactor
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const nextDue = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
  return { repetition, interval, efactor: ef, nextDue, lastReviewedAt: now.toISOString() };
}
