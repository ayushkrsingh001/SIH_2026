const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY, dangerouslyAllowBrowser: true });

function cleanJson(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    let cleaned = text;
    if (start !== -1 && end !== -1 && end >= start) {
      cleaned = text.substring(start, end + 1);
    } else {
      cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
    return cleaned.replace(/\n/g, ' ').replace(/\r/g, '');
}

async function testAnalyze() {
    const historyText = "- Topic: Cyber Safety, Score: 90%, Mistakes: \n- Topic: Child Rights, Score: 80%, Mistakes: ";
    
    const prompt = `You are the AI Safety Twin Engine for RightsQuest.
Analyze the following recent learning events for a child and generate an updated safety profile.

RECENT LEARNING HISTORY:
${historyText || 'No recent events.'}

CURRENT PROFILE (if exists):
New User

RULES:
1. Update the overallScore (0-100) based on their average performance, keeping previous scores in mind.
2. Update categoryScores (cyberSafety, childRights, girlsSafety, selfDefence, emergencyAwareness, digitalPrivacy, bullyingAwareness, roadSafety) based on the topics they interacted with. If a topic wasn't interacted with, keep its old score or default to 50 if new.
3. Identify 2-4 strengthAreas (topics they score > 80%).
4. Identify 2-4 weakAreas (topics they score < 60% or make many mistakes in).
5. Suggest a recommendedDifficulty ("Easy", "Medium", "Hard") based on their overall score.
6. RETURN EXACT JSON ONLY. NO MARKDOWN OUTSIDE JSON.

OUTPUT EXACT JSON:
{
  "overallScore": 85,
  "categoryScores": {
    "cyberSafety": 70,
    "childRights": 90,
    "girlsSafety": 85,
    "selfDefence": 60,
    "emergencyAwareness": 95,
    "digitalPrivacy": 50,
    "bullyingAwareness": 80,
    "roadSafety": 75
  },
  "strengthAreas": ["Emergency Awareness", "Child Rights"],
  "weakAreas": ["Digital Privacy", "Self Defence"],
  "recommendedDifficulty": "Medium"
}`;

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      console.log("Raw text:", text);
      const parsed = JSON.parse(cleanJson(text));
      console.log("Parsed:", parsed);
    } catch (err) {
      console.error('Safety Twin Analysis failed:', err);
    }
}

testAnalyze();
