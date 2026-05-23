// Using native fetch in Node 18+

module.exports = async (req, res) => {
  // Set CORS headers for local development and web requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const apiKey = process.env.CLAUDE_API_KEY || process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY is not configured on Vercel.' });
  }

  try {
    const systemPrompt = `You are a professional Nutritionist AI Assistant for the Indonesian Free Nutritious Meal (MBG) program.
Your job is to analyze the user's recipe query (which could be in casual Indonesian, questions, or specific menu requests, e.g. "sawi gulung isi tahu seperti di tiktok : 54g" or "kalau sawi gulung telur seberat 54 gram?").

Tasks:
1. Extract the actual menu name and the total weight (in grams) from the user's query. If no weight is mentioned, assume a standard portion of 100 grams.
2. Determine the typical raw ingredient breakdown for this menu.
3. Calculate the weight of each ingredient based on standard culinary proportions (ratios summing up exactly to 1.0).
4. Suggest the best search keywords for each ingredient to match the local Kemenkes TKPI database.
5. Provide a brief, friendly explanation in casual youth Indonesian with emojis.

Respond ONLY with a valid JSON object. Do not include any explanations outside of the JSON. Do not include markdown code block formatting.

Example Output format:
{
  "menuName": "Sawi gulung isi tahu",
  "totalWeight": 54,
  "explanation": "Ooh sawi gulung isi tahu yang viral di TikTok itu ya! Sawi putih dikukus lalu diisi tahu di tengahnya. Menyehatkan banget buat adik-adik di sekolah! 🥬✨",
  "ingredients": [
    {
      "nama": "Sawi putih",
      "ratio": 0.65,
      "searchKeyword": "sawi putih"
    },
    {
      "nama": "Tahu putih",
      "ratio": 0.35,
      "searchKeyword": "tahu"
    }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `User query: "${query}"`
          }
        ],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Anthropic API Error: ${errText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
