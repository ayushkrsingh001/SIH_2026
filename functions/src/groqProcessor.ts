import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const JSON_SCHEMA = `
{
  "title": "A catchy, simple title for the news article.",
  "summary": "A child-friendly, easy-to-understand summary of the news.",
  "whatHappened": "Detailed explanation of what exactly happened in the incident or news.",
  "lessons": "What can we learn from this incident? Educational takeaway.",
  "safetyTips": ["Actionable safety tips", "to prevent similar situations"],
  "legalAwareness": "What laws, rights, or legal frameworks relate to this? (e.g. POCSO Act, Consumer Protection).",
  "emergencyNumbers": ["1098", "1930"],
  "relatedTopic": "Broad category related to this news (e.g. Cyber Safety, Child Rights).",
  "suggestedLevelId": "A suggested level ID from the game if applicable, otherwise omit.",
  "difficulty": "easy, medium, or hard",
  "readTimeMinutes": 3,
  "rewardXP": 25,
  "badgeRecommendation": "A suggested badge to award if they read this.",
  "quizQuestions": [
    {
      "question": "question text",
      "type": "mcq, true_false, or decision",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "Explanation of why the answer is correct."
    }
  ]
}
`;

export async function processNewsArticle(title: string, description: string, content: string) {
  const prompt = `You are a Legal Awareness Educator for children and parents in India.
Your goal is to take the following raw news article and transform it into an educational, child-friendly learning card.

News Title: ${title}
Description: ${description}
Content: ${content}

Extract the details and return them strictly adhering to the following JSON schema:
${JSON_SCHEMA}

Ensure the tone is educational, empowering, and not overly graphic. Focus on safety and legal awareness. Provide 2-5 quiz questions.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    if (!resultText || resultText === '{}') throw new Error("Empty response from Groq");
    
    const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error processing news with Groq:", error);
    throw error;
  }
}
