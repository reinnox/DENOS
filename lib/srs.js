export function scheduleNext(card, correct) {
  // Very simple SRS: track interval in days and nextDue
  const now = new Date();
  let interval = card.interval || 1; // days
  if (correct) interval = Math.max(1, Math.round(interval * 2)); else interval = 1;
  const nextDue = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
  return { interval, nextDue, lastReviewedAt: now.toISOString() };
}
