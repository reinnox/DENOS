import React, { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function FlashcardEditor() {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); if (u) fetchCards(u.uid); else setCards([]); }), []);

  async function signIn() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }
  async function fetchCards(uid) {
    const col = collection(db, `users/${uid}/flashcards`);
    const snap = await getDocs(col);
    const arr = []; snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    setCards(arr);
  }
  async function createCard() {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/flashcards`), { front: newFront, back: newBack, language: 'en', createdAt: new Date().toISOString() });
    setNewFront(''); setNewBack(''); fetchCards(user.uid);
  }
  async function updateCard(cardId, updates) { if (!user) return; const d = doc(db, `users/${user.uid}/flashcards`, cardId); await updateDoc(d, { ...updates, updatedAt: new Date().toISOString() }); fetchCards(user.uid); }
  async function removeCard(cardId) { if (!user) return; const d = doc(db, `users/${user.uid}/flashcards`, cardId); await deleteDoc(d); fetchCards(user.uid); }

  return (
    <div style={{ padding: 16 }}>
      {!user ? (<div><button onClick={signIn}>Sign in with Google</button></div>) : (
        <div>
          <h3>Create flashcard</h3>
          <input value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="front (term)" />
          <input value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="back (definition)" />
          <button onClick={createCard}>Save</button>

          <h3>Your flashcards</h3>
          <ul>
            {cards.map(c => (
              <li key={c.id}><strong>{c.front}</strong> — {c.back}
                <button onClick={() => updateCard(c.id, { front: c.front + ' (edited)' })}>Edit</button>
                <button onClick={() => removeCard(c.id)}>Delete</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
