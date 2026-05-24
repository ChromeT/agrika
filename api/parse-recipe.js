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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body: ' + e.message });
    }
  }

  const query = body ? body.query : null;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter', received: body });
  }

  const claudeApiKey = process.env.CLAUDE_API_KEY || process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!claudeApiKey && !geminiApiKey) {
    return res.status(500).json({ error: 'Neither CLAUDE_API_KEY nor GEMINI_API_KEY is configured. Please set GEMINI_API_KEY for a 100% free option!' });
  }

  const systemPrompt = `You are a professional Nutritionist AI Assistant for the Indonesian Free Nutritious Meal (MBG) program.
Your job is to analyze the user's query, which can be:
A) A single recipe query (e.g. "sawi gulung isi tahu seperti di tiktok : 54g" or "kalau sawi gulung telur seberat 54 gram?")
B) A list of multiple food items with their respective weights (e.g. "Nasi putih 134 gr\n Ayam woku kemangi 77 gr\n Perkedel tahu 36 gr\n Sawi isi tahu 41 gr\n Anggur 48 gr")

Tasks for Case A (Single Recipe):
1. Extract the actual menu name and the total weight (in grams). If no weight is mentioned, assume 100 grams.
2. Determine typical raw ingredient proportions (ratios summing up exactly to 1.0).
3. Calculate the weight ("berat") in grams for each ingredient based on the proportions (e.g. totalWeight * ratio).
4. Suggest the best search keywords for each ingredient to query the Kemenkes TKPI database.

Tasks for Case B (List of Multiple Items):
1. Parse all items and their individual input weights.
2. Sum all the individual weights to compute the "totalWeight".
3. For compound recipe items (e.g. "Ayam woku", "Sawi isi tahu", "Perkedel tahu", "Telur semur bali", "Tempe goreng"), break them down into their 2-3 PRIMARY ingredients only using realistic culinary ratios.
   - For example, a fried item like "Tempe goreng : 25 gr" should be broken down into Tempe (~75-80% of weight, i.e. 18.8g) and Minyak kelapa sawit (~20-25% of weight, i.e. 6.2g).
   - A wet/boiled dish like "Telur semur bali : 75 gr" should be broken down into Telur ayam (~80-95% of weight, i.e. 60-70g) and Minyak kelapa sawit / bumbu (~5-20% of weight, e.g. 5-15g).
   - A vegetable mix like "Tumis labu siam jagung putren : 34 gr" should be broken down into Labu siam (~50% of weight, i.e. 17g) and Jagung muda (~40% of weight, i.e. 13.6g) and Minyak (~10% of weight, i.e. 3.4g). Keep the sum of broken-down weights exactly equal to the item's input weight!
4. For simple items (e.g. "Nasi putih", "Anggur", "Salak"), DO NOT break them down. Keep them as a single ingredient and keep their weight exactly as input (e.g. "Salak : 76 gr" must have weight exactly 76g, not 76.2g!).
5. For each ingredient row in the output, calculate:
   - "berat": the exact absolute weight in grams (e.g. 158 for Nasi putih 158g, 76 for Salak 76g).
   - "ratio": the ratio relative to the grand totalWeight (ratio = berat / totalWeight).
6. Ensure that the sum of "berat" of all ingredients in the list equals "totalWeight" exactly, and the sum of "ratio" equals 1.0 exactly.

Strict Rules for Ingredients:
- ONLY output the primary, macro-contributing ingredients (e.g. meat, main vegetable, main carb source, cooking oil).
- DO NOT list optional binders, spices, condiments (like shallots, garlic, chili, salt), or side ingredients as separate rows.
- Use standard, clean search keywords that exist in typical food databases:
  - "Nasi" or "Nasi putih" -> "nasi putih"
  - "Jagung putren" / "Jagung muda" -> "jagung muda, segar"
  - "Telur" -> "telur ayam ras, segar"
  - "Salak" -> "salak, segar"
  - "Tempe" -> "tempe pasar"
- Ensure keywords are clean and simple without unnecessary extra adjectives.

Provide a friendly explanation in casual youth Indonesian with emojis.
Respond ONLY with a valid JSON object. Do not include any explanations outside of the JSON. Do not include markdown code block formatting.

Example Output format:
{
  "menuName": "Sawi gulung isi tahu",
  "totalWeight": 54,
  "explanation": "Ooh sawi gulung isi tahu yang viral di TikTok itu ya! Sawi putih dikukus lalu diisi tahu di tengahnya. Menyehatkan banget buat adik-adip di sekolah! 🥬✨",
  "ingredients": [
    {
      "nama": "Sawi putih",
      "berat": 35.1,
      "ratio": 0.65,
      "searchKeyword": "sawi putih"
    },
    {
      "nama": "Tahu putih",
      "berat": 18.9,
      "ratio": 0.35,
      "searchKeyword": "tahu"
    }
  ]
}`;

  // Use Gemini if API key is configured (Gemini has a very generous free tier)
  if (geminiApiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `User query: "${query}"`
            }]
          }],
          systemInstruction: {
            parts: [{
              text: systemPrompt
            }]
          },
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${errText}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response structure from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      // Return formatted as expected by client App.js
      return res.status(200).json({
        content: [{
          text: responseText
        }]
      });
    } catch (geminiError) {
      if (!claudeApiKey) {
        return res.status(500).json({ error: `Gemini failed: ${geminiError.message}` });
      }
      console.log('Gemini failed, falling back to Claude:', geminiError.message);
    }
  }

  // Fallback to Claude
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
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
