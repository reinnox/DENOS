import React from 'react';
import dynamic from 'next/dynamic';
const FlashcardEditor = dynamic(() => import('../components/FlashcardEditor'), { ssr: false });

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1>DENOS — Flashcards Starter</h1>
      <p>Sign in with Google, upload an image or paste text to convert into flashcards.</p>
      <FlashcardEditor />
    </main>
  );
}
