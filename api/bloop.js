// /api/bloop.js  -- Vercel Serverless Function (Node)
// Uses OpenAI gpt-5-mini (user requested option 3)
// Deploy to Vercel and set the environment variable OPENAI_API_KEY in your project settings.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const body = req.body || {};
  const userText = body.text || body.message || '';
  if (!userText) return res.status(400).json({ error: 'No text provided' });

  // Read API key from environment
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are Bloop, a friendly neon-tech robot helper.' },
          { role: 'user', content: userText }
        ],
        max_tokens: 300
      })
    });

    if (!openaiResp.ok) {
      const txt = await openaiResp.text();
      return res.status(502).json({ error: 'OpenAI error', detail: txt });
    }

    const data = await openaiResp.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error in /api/bloop', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
