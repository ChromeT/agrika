// api/parse-recipe.js — Vercel Serverless Function for AI Recipe Parsing
// Loads TKPI database to provide exact name candidates to AI

const fs = require('fs');
const path = require('path');

// Load TKPI database at module level for reuse
let TKPI_DB = [];
try {
  const dbPath = path.join(__dirname, '..', 'tkpi_database.json');
  TKPI_DB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (e) {
  console.error('Failed to load TKPI database:', e.message);
}

/**
 * Pre-filter TKPI database entries that are relevant to the user's query.
 * Extracts food-related keywords from the query, then finds all TKPI entries
 * whose names contain any of those keywords.
 * Returns a deduplicated list of exact TKPI entry names.
 */
function getRelevantTkpiCandidates(query) {
  const queryLower = query.toLowerCase();
  
  // Extract likely food words from the query (remove numbers, units, punctuation)
  const foodWords = queryLower
    .replace(/[0-9]+/g, '')
    .replace(/(gram|gr|g|kg|ml|liter|porsi|buah|butir|lembar|iris|potong|sendok|sdm|sdt)\b/gi, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    // Remove common non-food words
    .filter(w => !['dan', 'atau', 'yang', 'ini', 'itu', 'ada', 'dari', 'untuk', 'dengan', 'seperti', 'tiktok', 'viral', 'kira', 'sekitar', 'kurang', 'lebih', 'menu', 'masakan', 'resep', 'bahan'].includes(w));
  
  if (foodWords.length === 0) return [];
  
  const candidates = new Set();
  
  for (const entry of TKPI_DB) {
    const nameLower = entry.nama.toLowerCase();
    // Check if any food word from query appears in the TKPI entry name
    for (const word of foodWords) {
      if (nameLower.includes(word)) {
        candidates.add(entry.nama);
        break;
      }
    }
  }
  
  // Also add common staples that may be implicit in compound recipes
  const commonStaples = [
    'Nasi', 'Tahu, mentah', 'Tahu goreng', 'Tempe pasar', 'Tempe pasar goreng',
    'Tempe kedelai murni, mentah', 'Tempe kedelai murni, goreng',
    'Telur ayam ras, segar (Domestic chicken, egg, fresh)',
    'Telur ayam kampung, segar (Feral chicken, egg, fresh)',
    'Minyak kelapa sawit (Palm oil)', 'Minyak kelapa (Coconut oil)',
    'Ayam, daging, segar (Chicken, meat, fresh)',
    'Sawi putih / pecai, segar (Pak choi, fresh)',
    'Sawi, segar (Chinese mustard, fresh)',
    'Labu siam, segar (Chayote, fresh)',
    'Jagung muda / semi, segar (Baby corn, fresh)',
    'Jagung muda, kuning, mentah (Corn,baby, yellow, raw)',
    'Salak, segar (snake fruit, fresh)',
    'Salak pondoh, segar (snake fruit, pondoh, fresh)',
    'Bayam, segar (Spinach, fresh)',
    'Wortel, segar (Carrot, fresh)',
    'Kangkung, segar (Water spinach, fresh)',
    'Buncis, segar (Snap bean, fresh)',
    'Kembang tahu',
  ];
  
  commonStaples.forEach(s => {
    if (TKPI_DB.some(e => e.nama === s)) {
      candidates.add(s);
    }
  });
  
  return Array.from(candidates);
}

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
    return res.status(500).json({ error: 'Neither CLAUDE_API_KEY nor GEMINI_API_KEY is configured.' });
  }

  // Pre-filter TKPI candidates based on query
  const tkpiCandidates = getRelevantTkpiCandidates(query);
  const tkpiCandidateList = tkpiCandidates.length > 0
    ? `\n\nAvailable TKPI Database Entries (use EXACT names from this list for "searchKeyword"):\n${tkpiCandidates.map(n => `- "${n}"`).join('\n')}`
    : '';

  const systemPrompt = `You are a professional Nutritionist AI Assistant for the Indonesian Free Nutritious Meal (MBG) program.
Your job is to analyze the user's query, which can be:
A) A single recipe query (e.g. "sawi gulung isi tahu seperti di tiktok : 54g" or "kalau sawi gulung telur seberat 54 gram?")
B) A list of multiple food items with their respective weights (e.g. "Nasi putih 134 gr\\n Ayam woku kemangi 77 gr\\n Perkedel tahu 36 gr\\n Sawi isi tahu 41 gr\\n Anggur 48 gr")

Tasks for Case A (Single Recipe):
1. Extract the actual menu name and the total weight (in grams). If no weight is mentioned, assume 100 grams.
2. Determine typical raw ingredient proportions using realistic culinary ratios.
3. Calculate the weight ("berat") in grams for each ingredient.
4. For "searchKeyword", you MUST choose the EXACT entry name from the TKPI Database list provided below.

Tasks for Case B (List of Multiple Items):
1. Parse all items and their individual input weights.
2. Sum all the individual weights to compute the "totalWeight".
3. For compound recipe items (e.g. "Ayam woku", "Telur semur bali", "Tempe goreng", "Tumis labu siam jagung putren"), break them down into 2-3 PRIMARY ingredients using realistic culinary ratios:
   - Fried items (goreng): main ingredient ~75-80%, cooking oil ~20-25%
   - Wet/braised dishes (semur/gulai/rendang): main protein ~80-90%, cooking oil/sauce ~10-20%
   - Stir-fried vegetables (tumis/cah): vegetables ~45-50% each, oil ~5-10%
   - The SUM of broken-down ingredient weights MUST EQUAL the item's input weight EXACTLY.
4. For simple items (e.g. "Nasi", "Anggur", "Salak"), DO NOT break them down. Keep as single ingredient with weight exactly as input.
5. Each ingredient must have:
   - "berat": exact weight in grams (integer or 1-decimal, no unnecessary precision)
   - "ratio": berat / totalWeight
   - "searchKeyword": EXACT entry name from the TKPI Database list below
6. Sum of all "berat" must equal "totalWeight". Sum of all "ratio" must equal 1.0.

CRITICAL RULES for searchKeyword:
- You MUST use an EXACT entry name from the TKPI Database list below. Copy the name EXACTLY as written, including parentheses and commas.
- For "Nasi putih" or just "Nasi" → use "Nasi"
- For "Tahu" (raw/default) → use "Tahu, mentah"
- For "Tahu goreng" → use "Tahu goreng"
- For "Tempe" (raw/default) → use "Tempe pasar"
- For "Tempe goreng" → use "Tempe pasar goreng" or "Tempe kedelai murni, goreng"
- For "Telur ayam" → use "Telur ayam ras, segar (Domestic chicken, egg, fresh)"
- For "Minyak goreng" → use "Minyak kelapa sawit (Palm oil)"
- For "Salak" → use "Salak, segar (snake fruit, fresh)"
- NEVER invent a keyword not in the list. If no exact match exists, use the closest available entry.

Strict Rules for Ingredients:
- ONLY output primary, macro-contributing ingredients.
- DO NOT list spices, condiments, salt, garlic, shallots as separate rows.

Provide a friendly explanation in casual youth Indonesian with emojis.
Respond ONLY with a valid JSON object. No markdown formatting.

Example Output:
{
  "menuName": "Sawi gulung isi tahu",
  "totalWeight": 54,
  "explanation": "Ooh sawi gulung isi tahu yang viral di TikTok itu ya! Sawi putih dikukus lalu diisi tahu di tengahnya. Menyehatkan banget! 🥬✨",
  "ingredients": [
    {
      "nama": "Sawi putih",
      "berat": 35,
      "ratio": 0.648,
      "searchKeyword": "Sawi putih / pecai, segar (Pak choi, fresh)"
    },
    {
      "nama": "Tahu",
      "berat": 19,
      "ratio": 0.352,
      "searchKeyword": "Tahu, mentah"
    }
  ]
}${tkpiCandidateList}`;

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
