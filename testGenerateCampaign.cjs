// No dotenv
const Groq = require('groq-sdk');

const API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const client = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

const SYSTEM_INSTRUCTION = `You are an educational game content generator for "RightsQuest", an Indian legal awareness game for children aged 8-16.

RULES:
1. Return ONLY valid JSON. No markdown, no explanations, no extra text.
2. All content must be safe, educational, age-appropriate, and legally accurate for India.
3. Never invent laws. Only use real Indian laws, acts, and constitutional articles.
4. Use official Indian emergency numbers: 112, 1098, 1091, 1930, 100, 101, 108.
5. DO NOT use unescaped newlines inside JSON string values. Keep text as single continuous strings without line breaks.
6. No violence, political bias, religious bias, graphic content, or frightening descriptions.
7. Characters should be relatable Indian children with realistic scenarios.
8. Stories should naturally lead into the questions.
9. CRITICAL: Questions MUST be detailed, long (at least 3-4 sentences), and present a highly specific legal dilemma.
10. CRITICAL: Options must be well-thought-out. The legalFact and explanation MUST cite specific Indian laws.

OUTPUT FORMAT (strict JSON):
{
  "world": "<world name>",
  "level": <number>,
  "title": "<creative title>",
  "story": "<100-300 word story intro with relatable Indian characters>",
  "difficulty": "<Easy|Medium|Hard|Expert>",
  "estimatedTime": "<X minutes>",
  "learningObjective": "<what the player will learn>",
  "questions": [
    {
      "type": "<mcq|true_false|decision|order_sequence|scenario>",
      "question": "<question text>",
      "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
      "correctAnswer": "<exact text of correct option>",
      "explanation": "<why this is correct>",
      "legalFact": "<relevant Indian law or fact>",
      "xp": <10-30>
    }
  ],
  "reward": {
    "coins": <50-200>,
    "xp": <100-500>,
    "badge": "<optional badge name or null>"
  }
}`;

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

function validateLevel(level) {
    if (!level.title || !level.story || !level.questions || !Array.isArray(level.questions)) {
      throw new Error('Invalid level structure: missing required fields');
    }
    if (level.questions.length < 3) {
      throw new Error(`Too few questions: ${level.questions.length}`);
    }
    for (const q of level.questions) {
      if (!q.question || !q.correctAnswer || !q.explanation) {
        throw new Error('Invalid question: missing required fields');
      }
      if (q.type !== 'true_false') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
           q.options = [q.correctAnswer, "I don't know", "Ignore it", "Ask for help"];
        }
        if (!q.options.includes(q.correctAnswer)) {
          q.options[0] = q.correctAnswer;
        }
      }
    }
    if (!level.reward) {
      throw new Error('Invalid reward structure: missing reward');
    }
    if (typeof level.reward.xp === 'string') {
      level.reward.xp = parseInt(level.reward.xp, 10);
    }
    if (typeof level.reward.coins === 'string') {
      level.reward.coins = parseInt(level.reward.coins, 10);
    }
    if (typeof level.reward.xp !== 'number' || isNaN(level.reward.xp)) {
      throw new Error(`Invalid reward structure: xp is ${level.reward.xp}`);
    }
}

async function testGenerate() {
  const prompt = `Generate a playable educational level for the game RightsQuest.

PLAYER PROFILE:
- Age Group: 8-11
- Difficulty: Easy

SPECIFIC LEVEL TOPIC:
- Category: Child Rights
- Specific Title/Focus: Right to Play

REQUIREMENTS:
- Generate exactly 5 to 7 unique questions
- Mix at least 2 different question types
- Story must feature Indian children in relatable scenarios relevant to "Right to Play"
- All legal facts must reference real Indian laws
- Difficulty should match: Easy`;

  console.log("Calling Groq...");
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  });

  const text = response.choices[0]?.message?.content || '{}';
  console.log("Raw Response length: ", text.length);
  
  try {
    const cleaned = cleanJson(text);
    const parsed = JSON.parse(cleaned);
    console.log("JSON parsed successfully");
    validateLevel(parsed);
    console.log("Validation passed");
  } catch(e) {
    console.error("Error:", e.message);
    console.log("Raw output was:", text.substring(0, 500) + "...");
  }
}

testGenerate();
