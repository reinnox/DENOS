const fetch = require('node-fetch');
const { db } = require('../../lib/firebaseAdmin');

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are an AI tutor. Answer helpfully and concisely.' }, { role: 'user', content: prompt }], max_tokens: 800 }),
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { uid, message } = req.body;
    if (!uid || !message) return res.status(400).json({ error: 'uid and message required' });

    // Fetch recent flashcards for context
    const snap = await db.collection(`users/${uid}/flashcards`).orderBy('createdAt', 'desc').limit(20).get();
    const cards = [];
    snap.forEach(d => cards.push(d.data()));

    const contextSnippet = cards.slice(0, 10).map(c => `- ${c.front}: ${c.back}`).join('\n');

    const prompt = `You are an AI tutor assisting a student. Use the following study cards as context:\n${contextSnippet}\n\nStudent question: ${message}\n\nProvide a clear, friendly explanation and actionable study tips referencing the cards when helpful.`;

    const answer = await callOpenAI(prompt);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
}
