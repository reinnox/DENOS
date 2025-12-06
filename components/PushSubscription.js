import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function PushSubscription() {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  async function subscribe() {
    if (!user) return alert('Sign in first');
    try {
      const messaging = (await import('firebase/messaging')).getMessaging();
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || '';
      const token = await (await import('firebase/messaging')).getToken(messaging, { vapidKey });
      if (!token) return alert('Unable to get FCM token');
      // send token to server
      await fetch('/api/subscribe-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: user.uid, fcmToken: token }) });
      alert('Subscribed to push notifications');
    } catch (err) { console.error(err); alert('Failed to subscribe: ' + err.message); }
  }

  return (
    <div>
      <p>Push notifications: permission = {permission}</p>
      <button onClick={() => Notification.requestPermission().then(p => setPermission(p))}>Request permission</button>
      <button onClick={subscribe}>Subscribe with FCM</button>
    </div>
  );
}
