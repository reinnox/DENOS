import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { scheduleNext } from '../lib/srs';

export default function StudyPage() {
  const [user, setUser] = useState(null);
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); if (u) loadDue(u.uid); }), []);

  async function loadDue(uid) {
    // Simple logic: fetch cards with nextDue <= now or no nextDue
    const now = new Date().toISOString();
    const col = collection(db, `users/${uid}/flashcards`);
    const snap = await getDocs(col);
    const arr = [];
    snap.forEach(d => {
      const data = d.data();
      arr.push({ id: d.id, ...data });
    });
    // Sort by nextDue ascending (undefined at top)
    arr.sort((a, b) => {
      if (!a.nextDue) return -1;
      if (!b.nextDue) return 1;
      return new Date(a.nextDue) - new Date(b.nextDue);
    });
    setDeck(arr.slice(0, 50));
    setIndex(0);
    setShowBack(false);
  }

  async function mark(correct) {
    if (!user || !deck[index]) return;
    const card = deck[index];
    const updated = scheduleNext(card, correct);
    const dref = doc(db, `users/${user.uid}/flashcards`, card.id);
    await updateDoc(dref, updated);
    const nextIndex = (index + 1) % deck.length;
    setIndex(nextIndex);
    setShowBack(false);
  }

  if (!user) return <div style={{ padding: 16 }}>Please sign in to study.</div>;
  if (!deck.length) return <div style={{ padding: 16 }}>No cards due — good job!</div>;

  const item = deck[index];
  return (
    <div style={{ padding: 16 }}>
      <h2>Study</h2>
      <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, maxWidth: 700 }}>
        <h3>{item.front}</h3>
        {showBack && <p>{item.back}</p>}
        <p><em>{item.example}</em></p>
        <div>
          <button onClick={() => setShowBack(!showBack)}>{showBack ? 'Hide' : 'Show'} Answer</button>
          <button onClick={() => mark(true)}>I knew it</button>
          <button onClick={() => mark(false)}>I forgot</button>
        </div>
      </div>
    </div>
  );
}
