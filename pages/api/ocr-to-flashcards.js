const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fetch = require('node-fetch');

const visionClient = new ImageAnnotatorClient();

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are an assistant that extracts important words and creates flashcards.' }, { role: 'user', content: prompt }],
      max_tokens: 800,
    }),
  });
  const data = await res.json();
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { imageBase64, plainText, targetLanguage = 'en' } = req.body;
    let text = plainText;
    if (imageBase64) {
      const [result] = await visionClient.textDetection({ image: { content: imageBase64 } });
      const detections = result.textAnnotations;
      text = detections && detections.length ? detections[0].description : '';
    }
    if (!text || !text.trim()) return res.status(400).json({ error: 'No text found' });

    const prompt = `You will be given a block of text. Extract the top 10 important single words or short phrases (no more than 3 words each) that would make useful flashcards. For each item, return a JSON array of objects with these fields:\n- front: the word/phrase in the requested language (${targetLanguage})\n- back: a concise definition (1-2 sentences) in the requested language\n- example: a short example sentence using the word (in the same language)\n- tags: array of suggested tags\nOnly return valid JSON.\n\nText:\n"""${text}"""`;

    const openaiResp = await callOpenAI(prompt);
    const raw = openaiResp.choices?.[0]?.message?.content || '';
    let cards = [];
    try { cards = JSON.parse(raw); } catch (err) {
      const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) cards = JSON.parse(match[0]); else throw err;
    }
    if (!Array.isArray(cards)) return res.status(500).json({ error: 'LLM did not return an array' });

    const timestamp = new Date().toISOString();
    const enriched = cards.map((c, i) => ({ id: `card_${Date.now()}_${i}`, front: c.front, back: c.back, example: c.example, tags: c.tags || [], language: targetLanguage, source: imageBase64 ? 'image' : 'text', createdAt: timestamp }));

    res.json({ cards: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
}
