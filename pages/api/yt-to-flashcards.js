// Simple endpoint to accept a transcript (or videoId if you provide transcripts separately) and return flashcards
const fetch = require('node-fetch');
async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 1000 }) });
  return (await res.json()).choices?.[0]?.message?.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript required' });
    const prompt = `From this lecture transcript, extract the top 12 important concepts and return them as JSON flashcards with front, back (short definition), example, and tags. Transcript:\n"""${transcript.substring(0, 15000)}"""`;
    const out = await callOpenAI(prompt);
    let cards = [];
    try { cards = JSON.parse(out); } catch (e) { const m = out.match(/\[[\s\S]*\]/); if (m) cards = JSON.parse(m[0]); }
    res.json({ cards });
  } catch (err) { console.error(err); res.status(500).json({ error: String(err) }); }
}
