// Placeholder that accepts a FCM token from clients and stores in Firestore for scheduled notifications
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { uid, fcmToken } = req.body;
    if (!uid || !fcmToken) return res.status(400).json({ error: 'uid and fcmToken required' });
    await addDoc(collection(db, `users/${uid}/fcmTokens`), { token: fcmToken, createdAt: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: String(err) }); }
}
