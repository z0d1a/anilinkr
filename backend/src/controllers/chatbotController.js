const { DEEPSEEK_API_KEY } = process.env;
const fetch = require('node-fetch');

async function getRecommendation(req, res) {
  try {
    const { isAdult, genres, similarTo, description } = req.body;

    // Enhanced prompt engineering:
    const prompt = `
You are an AI specialized in manga/manhwa recommendations. The user has provided:
- Adult content: ${isAdult ? 'Yes' : 'No'}
- Preferred genres: ${genres || 'None specified'}
- Similar to: ${similarTo || 'No specific title'}
- Additional preferences: ${description || 'None'}

Please recommend 5 ${isAdult ? 'adult ' : ''}manga/manhwa based on these inputs. For each recommendation, provide:
• Make sure adult content are all manhwa titles. Make sure they exist
• The title in **bold**,
• A detailed summary,
• If it is an adult content, A comparison of materialistic elements of the manga/manhwa (big dick, big tits, huge ass, etc.) MAKE SURE TO BE EXPLICIT,
• And a brief reason why it matches the user's request.

Format your response as Markdown bullet points. Avoid repeating the user’s input verbatim, and keep it succinct yet informative.
`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('DeepSeek API error');
    }

    const data = await response.json();
    res.json({
      text: data.choices[0].message.content
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

module.exports = { getRecommendation };
