// Server endpoint to ingest RSS / news and turn articles into candidate flashcards
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const parser = new Parser();

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 800 }),
  });
  return (await res.json()).choices?.[0]?.message?.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { feedUrl, max = 5 } = req.body;
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items.slice(0, max);
    const cardsAll = [];
    for (const it of items) {
      const text = it.contentSnippet || it.content || it.title;
      const prompt = `Create up to 5 flashcards (JSON array) from this short news/article text. Include front, back, example, tags. Text:\n"""${text}"""`;
      const out = await callOpenAI(prompt);
      // attempt parse
      let cards = [];
      try { cards = JSON.parse(out); } catch (e) { const m = out.match(/\[[\s\S]*\]/); if (m) cards = JSON.parse(m[0]); }
      if (Array.isArray(cards)) cardsAll.push(...cards);
    }
    res.json({ cards: cardsAll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
}
