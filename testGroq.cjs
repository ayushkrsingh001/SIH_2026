const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY || 'YOUR_API_KEY', dangerouslyAllowBrowser: true });

async function test() {
  const prompt = `You are generating content for a personalized digital certificate for a child playing the "RightsQuest" legal awareness game.
    
CHILD DETAILS:
- Name: Aditya
- Age Group: 8-11
- Certificate Type: 5 Quests Master

RULES:
1. Return ONLY valid JSON.
2. Make it sound extremely prestigious, encouraging, and personalized.

OUTPUT FORMAT (strict JSON):
{
  "title": "<Certificate Title e.g., 'Child Rights Champion', 'Cyber Hero', etc.>",
  "description": "<A 1-2 sentence description of the achievement>",
  "learningSummary": "<A 2-3 sentence summary of what the child learned to earn this>",
  "skillsLearned": ["<Skill 1>", "<Skill 2>", "<Skill 3>"],
  "encouragement": "<A short personalized congratulatory message>",
  "nextGoal": "<A short suggestion for what they should learn next>"
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Return ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    console.log(response.choices[0].message.content);
  } catch (e) {
    console.error(e);
  }
}

test();
