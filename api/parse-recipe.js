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

  const { menuName, totalWeight } = req.body;
  if (!menuName || !totalWeight) {
    return res.status(400).json({ error: 'Missing menuName or totalWeight parameter' });
  }

  const apiKey = process.env.CLAUDE_API_KEY || process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY is not configured on Vercel.' });
  }

  try {
    const systemPrompt = `You are a professional Nutritionist AI Assistant for the Indonesian Free Nutritious Meal (MBG) program.
Your job is to analyze the custom/mix recipe menu query, determine the typical ingredient breakdown, find the best matching food items, and return the breakdown along with search keywords to query the local Kemenkes TKPI database.

Analyze the input menu and total weight (in grams), estimate the standard culinary proportion (ratios summing up exactly to 1.0), and suggest the best search keywords for each ingredient to match the local TKPI database.
You must respond ONLY with a valid JSON object. Do not include any explanations outside of the JSON. Do not include markdown code block formatting.

Example Output format:
{
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

    const userPrompt = `Analyze the menu: "${menuName}" with total weight: ${totalWeight} grams. Make sure the ingredients ratios sum up to 1.0.`;

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
            content: userPrompt
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
