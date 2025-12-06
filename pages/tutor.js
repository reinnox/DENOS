import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function TutorPage() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  async function send() {
    if (!user) return alert('Sign in first');
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: user.uid, message: input }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
      setInput('');
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>AI Tutor</h2>
      {!user ? <p>Please sign in to use the tutor.</p> : (
        <div>
          <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #eee', padding: 12 }}>
            {messages.map((m, i) => <div key={i} style={{ margin: 8 }}><strong>{m.role}</strong><div>{m.text}</div></div>)}
          </div>
          <div style={{ marginTop: 8 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} style={{ width: '100%' }} />
            <button onClick={send} disabled={loading}>{loading ? 'Thinking...' : 'Ask Tutor'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
