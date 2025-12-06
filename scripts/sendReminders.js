// Node script to send study reminders to users with due flashcards.
// Run this as a cron job or cloud scheduler: NODE_ENV=production node scripts/sendReminders.js

const { db, messaging } = require('../lib/firebaseAdmin');

async function run() {
  console.log('Running reminder job');
  const now = new Date().toISOString();
  // Query users (naive: list all user docs under /users)
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    // Find any flashcards due now or in past
    const cardsSnap = await db.collection(`users/${uid}/flashcards`).where('nextDue', '<=', now).limit(10).get();
    if (cardsSnap.empty) continue;
    // Get tokens
    const tokensSnap = await db.collection(`users/${uid}/fcmTokens`).get();
    const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
    if (!tokens.length) continue;
    const payload = {
      notification: { title: 'Study reminder', body: `You have ${cardsSnap.size} cards due. Time to study!` },
    };
    try {
      const res = await messaging.sendToDevice(tokens, payload);
      console.log('Sent to', uid, 'result', res.successCount || 0);
    } catch (e) { console.error('Error sending to', uid, e); }
  }
  console.log('Reminder job finished');
}

if (require.main === module) {
  run().catch(err => { console.error(err); process.exitCode = 1; });
}
