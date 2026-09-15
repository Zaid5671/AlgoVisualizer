export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // The Gemini API Key is now safely hidden on the Vercel server
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server configuration error: GEMINI_API_KEY is missing.' } });
  }

  try {
    // Extract the prompt from the incoming request body
    const { contents } = req.body;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    
    let data = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contents }),
        });

        const json = await response.json();
        
        if (json.error) {
          throw new Error(json.error.message);
        }

        data = json;
        break; // Successfully got response, stop trying models
      } catch (err) {
        console.warn(`Model ${model} failed:`, err.message);
        lastError = err;
      }
    }

    if (!data) {
      return res.status(500).json({ error: { message: lastError ? lastError.message : "All fallback models failed." } });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in chat proxy:', error);
    return res.status(500).json({ error: { message: 'Failed to communicate with Gemini API' } });
  }
}
