import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UploadPage() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [imageData, setImageData] = useState(null);
  const [plainText, setPlainText] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef();

  React.useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera error', err);
      alert('Unable to access camera');
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImageData(dataUrl.split(',')[1]);
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result.toString();
      setImageData(res.split(',')[1]);
    };
    reader.readAsDataURL(f);
  }

  async function sendToOCR() {
    if (!imageData && !plainText) return alert('Add an image or paste text');
    setLoading(true);
    try {
      const resp = await fetch('/api/ocr-to-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageData, plainText, targetLanguage: lang }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      // Save cards to Firestore under user
      if (user) {
        const batch = [];
        for (const c of data.cards) {
          await addDoc(collection(db, `users/${user.uid}/flashcards`), { ...c, owner: user.uid });
        }
        alert('Flashcards created and saved to your account');
      } else {
        // If no user, just show result
        alert('Generated ' + (data.cards?.length || 0) + ' cards (not saved because you are not signed in)');
        console.log(data.cards);
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Upload / Capture</h2>
      <div>
        <label>Language: </label>
        <select value={lang} onChange={e => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="my">Myanmar</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <input type="file" accept="image/*" onChange={handleFile} />
        <div>
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={captureFromCamera}>Capture</button>
          <video ref={videoRef} autoPlay style={{ width: 320, height: 240 }} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea value={plainText} onChange={e => setPlainText(e.target.value)} placeholder="Or paste text here" rows={6} style={{ width: '100%' }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={sendToOCR} disabled={loading}>{loading ? 'Processing...' : 'Convert to Flashcards'}</button>
      </div>
    </div>
  );
}
