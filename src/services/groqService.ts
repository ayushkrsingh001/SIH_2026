import Groq from 'groq-sdk';
import type { AIGeneratedLevel, LevelContext, SafetyTwinProfile, LearningEvent, AIReport } from '../types';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

const SYSTEM_INSTRUCTION = `You are an educational game content generator for "RightsQuest", an Indian legal awareness game for children aged 8-16.

RULES:
1. Return ONLY valid JSON. No markdown, no explanations, no extra text.
2. All content must be safe, educational, age-appropriate, and legally accurate for India.
3. Never invent laws. Only use real Indian laws, acts, and constitutional articles (e.g., IPC, POCSO, IT Act, Consumer Protection Act, Constitution Articles).
4. Use official Indian emergency numbers: 112 (National Emergency), 1098 (Childline), 1091 (Women Helpline), 1930 (Cyber Crime), 100 (Police), 101 (Fire), 108 (Ambulance).
5. DO NOT use unescaped newlines inside JSON string values. Keep text as single continuous strings without line breaks.
5. No violence, political bias, religious bias, graphic content, or frightening descriptions.
6. Characters should be relatable Indian children with realistic scenarios.
7. Stories should naturally lead into the questions.
8. Never repeat the same question, story, or character name within a session.
9. CRITICAL: Questions MUST be detailed, long (at least 3-4 sentences), and present a highly specific legal dilemma. DO NOT generate short or trivial questions.
10. CRITICAL: Options must be well-thought-out. The legalFact and explanation MUST cite specific Indian laws, Articles, or Acts and explain them deeply.

QUESTION TYPES YOU CAN USE:
- "mcq": Multiple choice with 4 options
- "true_false": True or false statement
- "decision": A scenario where the player must choose the best action
- "order_sequence": Arrange steps in the correct order (provide items as options)
- "scenario": Analyze a situation and pick the safest/legal response

DIFFICULTY GUIDELINES:
- Easy (age 8-10): Foundational rights and basic safety. Questions MUST still be detailed scenarios (3-4 sentences) but use simple language.
- Medium (age 11-13): Introduce specific laws and constitutional rights. Scenarios must be complex, real-life situations requiring critical thinking.
- Hard (age 14-16): Advanced legal concepts, exact Sections/Articles (e.g., Article 21, Section 66E). Wrong options should be highly plausible to trick the player.
- Expert: Multi-layered legal scenarios combining multiple rights, laws, and intricate situational variables.

TOPICS YOU CAN COVER:
Child Rights, Women's Rights, Girls Safety, Cyber Safety, Self Defence, Road Safety, Emergency Awareness, Consumer Rights, Environmental Laws, Constitution, Fundamental Rights, Fundamental Duties, Digital Privacy, Bullying, Stranger Danger, Disaster Management, Internet Scams, Good Touch Bad Touch, Emergency Numbers, Legal Awareness

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

const TOPIC_MAP: Record<number, string[]> = {
  1: ['Child Rights', 'Right to Education', 'Right to Health', 'Safe Boundaries', 'Bullying', 'Stranger Danger', 'School Safety', 'Emergency Numbers', 'Digital Privacy'],
  2: ['Cyber Safety', 'Internet Scams', 'Digital Privacy', 'Online Bullying', 'Social Media Safety', 'Password Security', 'Phishing', 'Gaming Safety'],
  3: ['Girls Safety', "Women's Rights", 'Self Defence', 'Transport Safety', 'SOS Features', 'Workplace Safety', 'Eve Teasing Laws', 'Safe Zones'],
  4: ['Self Defence', 'Road Safety', 'Disaster Management', 'First Aid Basics', 'Fire Safety', 'Earthquake Safety', 'Flood Safety'],
  5: ['Consumer Rights', 'Environmental Laws', 'Constitution', 'Fundamental Rights', 'Fundamental Duties', 'RTI', 'Legal Awareness', 'Voting Rights'],
};

const WORLD_NAMES: Record<number, string> = {
  1: 'Child Rights Island',
  2: 'Cyber Guardian',
  3: 'Girls Safety Shield',
  4: 'Self Defence Academy',
  5: 'Legal Hero',
};

const EVENT_THEMES: Record<string, { name: string; topics: string[]; description: string }> = {
  'childrens_day': { name: "Children's Day Special", topics: ['Child Rights', 'Right to Education', 'Right to Play'], description: 'Celebrate Children\'s Day by learning about your rights!' },
  'cyber_awareness': { name: 'Cyber Awareness Month', topics: ['Cyber Safety', 'Digital Privacy', 'Internet Scams', 'Phishing'], description: 'Stay safe online this Cyber Awareness Month!' },
  'republic_day': { name: 'Republic Day Special', topics: ['Constitution', 'Fundamental Rights', 'Fundamental Duties'], description: 'Celebrate our Constitution and your fundamental rights!' },
  'independence_day': { name: 'Independence Day Special', topics: ['Fundamental Rights', 'Constitution', 'Legal Awareness'], description: 'Celebrate freedom and learn about your rights!' },
  'womens_day': { name: "Women's Safety Week", topics: ['Girls Safety', "Women's Rights", 'Self Defence'], description: 'Empowering every girl and woman with knowledge!' },
  'environment_day': { name: 'Environment Day', topics: ['Environmental Laws', 'Disaster Management'], description: 'Protect our planet with legal knowledge!' },
};

function buildPrompt(context: LevelContext, type: string, extraInstructions?: string): string {
  const worldTopics = TOPIC_MAP[context.currentWorld] || TOPIC_MAP[1];
  const worldName = WORLD_NAMES[context.currentWorld] || 'Adventure World';

  let prompt = `Generate a ${type} for the game RightsQuest.

PLAYER PROFILE:
- Age Group: ${context.playerAge}
- Current World: ${context.currentWorld} (${worldName})
- Current Level: ${context.currentLevel}
- Difficulty: ${context.difficulty}
- XP: ${context.currentXp}
- Badges: ${context.badgesEarned.length > 0 ? context.badgesEarned.join(', ') : 'None yet'}
- Language: ${context.language}

TOPICS FOR THIS WORLD: ${worldTopics.join(', ')}

WEAK TOPICS (focus more on these): ${context.weakTopics.length > 0 ? context.weakTopics.join(', ') : 'None identified yet'}
STRONG TOPICS (less focus): ${context.strongTopics.length > 0 ? context.strongTopics.join(', ') : 'None identified yet'}
ALREADY COMPLETED TOPICS: ${context.completedTopics.length > 0 ? context.completedTopics.join(', ') : 'None'}

REQUIREMENTS:
- Generate exactly 5 to 8 unique questions
- Mix at least 3 different question types
- Story must feature Indian children in relatable scenarios
- All legal facts must reference real Indian laws
- Difficulty should match: ${context.difficulty}`;

  if (context.avoidQuestions.length > 0) {
    prompt += `\n- AVOID these previously used question themes: ${context.avoidQuestions.slice(0, 10).join(', ')}`;
  }

  if (extraInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${extraInstructions}`;
  }

  return prompt;
}

class GroqLevelGenerator {
  private groqClient: Groq | null = null;

  private getClient(): Groq {
    if (!this.groqClient) {
      if (!API_KEY) {
        throw new Error('VITE_GROQ_API_KEY is not set. Please add it to your .env file.');
      }
      this.groqClient = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
    }
    return this.groqClient;
  }

  private cleanJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    let cleaned = text;
    if (start !== -1 && end !== -1 && end >= start) {
      cleaned = text.substring(start, end + 1);
    } else {
      cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    // Fix trailing commas which break JSON.parse
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
    
    // Replace all literal newlines with spaces to prevent JSON.parse from failing on unescaped newlines in strings
    return cleaned.replace(/\n/g, ' ').replace(/\r/g, '');
  }

  private async _executeGroqCall(systemPrompt: string, userPrompt: string): Promise<string> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });
    return response.choices[0]?.message?.content || '{}';
  }

  private async _executeOpenRouterCall(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('VITE_OPENROUTER_API_KEY is not set. OpenRouter fallback is unavailable.');
    }
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter Error ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return data.choices[0]?.message?.content || '{}';
  }

  private async callGroq(userPrompt: string, retries = 3, expectedType: 'level' | 'json_object' = 'level'): Promise<any> {
    const systemPrompt = expectedType === 'level' ? SYSTEM_INSTRUCTION : 'You are a helpful AI assistant. Return ONLY valid JSON.';
    
    let lastError: any = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Alternate providers: Even attempts try Groq, Odd attempts try OpenRouter
        const useGroq = attempt % 2 === 0;
        
        let text = '';
        if (useGroq) {
          console.log(`[AI Engine] Attempt ${attempt + 1}: Generating via Groq...`);
          text = await this._executeGroqCall(systemPrompt, userPrompt);
        } else {
          console.log(`[AI Engine] Attempt ${attempt + 1}: Generating via OpenRouter (Fallback)...`);
          text = await this._executeOpenRouterCall(systemPrompt, userPrompt);
        }
        
        // Parse, sanitize and validate
        const rawParsed = JSON.parse(this.cleanJson(text));
        const parsed = this.sanitizeNestedArrays(rawParsed);
        
        if (expectedType === 'level') {
          this.validateLevel(parsed as AIGeneratedLevel);
        }
        return parsed;
      } catch (err) {
        lastError = err;
        console.warn(`[AI Engine] Attempt ${attempt + 1} failed:`, err);
        
        if (attempt === retries) {
          throw new Error(`Failed to generate after ${retries + 1} attempts. Last error: ${err}`);
        }
        
        // Short delay before retrying with the other provider
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw lastError;
  }

  private sanitizeNestedArrays(obj: any): any {
    if (Array.isArray(obj)) {
      // If any element is an array, flatten the whole array completely
      if (obj.some(el => Array.isArray(el))) {
        const flat = obj.flat(Infinity);
        return flat.map((item: any) => this.sanitizeNestedArrays(item));
      }
      return obj.map((item: any) => this.sanitizeNestedArrays(item));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = this.sanitizeNestedArrays(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  private validateLevel(level: AIGeneratedLevel): void {
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
      
      // Ensure all types except true_false have valid options
      if (q.type !== 'true_false') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
           // If missing options, try to auto-generate a fallback array
           q.options = [q.correctAnswer, "I don't know", "Ignore it", "Ask for help"];
        }
        
        // Ensure correctAnswer is exactly one of the options
        if (!q.options.includes(q.correctAnswer)) {
          // Replace a random option (or the first one) with the correct answer
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

  async generateLevel(context: LevelContext): Promise<AIGeneratedLevel> {
    const prompt = buildPrompt(context, 'playable educational level');
    return this.callGroq(prompt);
  }

  async generateCampaignLevel(moduleTitle: string, category: string, difficulty: string, ageGroup: string): Promise<AIGeneratedLevel> {
    const prompt = `Generate a playable educational level for the game RightsQuest.

PLAYER PROFILE:
- Age Group: ${ageGroup}
- Difficulty: ${difficulty}

SPECIFIC LEVEL TOPIC:
- Category: ${category}
- Specific Title/Focus: ${moduleTitle}

REQUIREMENTS:
- Generate exactly 5 to 7 unique questions
- Mix at least 2 different question types
- Story must feature Indian children in relatable scenarios relevant to "${moduleTitle}"
- All legal facts must reference real Indian laws
- Difficulty should match: ${difficulty}`;

    return this.callGroq(prompt);
  }

  async generateDailyChallenge(context: LevelContext & { recentDailyTopics?: string[] }): Promise<AIGeneratedLevel> {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    
    // Simple event check
    const events: Record<string, string> = {
      'November 14': 'Children\'s Day Special! Focus on Child Rights.',
      'January 26': 'Republic Day Special! Focus on the Constitution.',
      'August 15': 'Independence Day Special! Focus on Fundamental Duties.',
      'March 8': 'Women\'s Day Special! Focus on Gender Equality.',
      'November 26': 'Constitution Day Special! Focus on Preamble and Rights.',
    };
    
    let eventText = '';
    const dateMatch = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}`;
    if (events[dateMatch]) {
      eventText = `IMPORTANT: Today is a special event: ${events[dateMatch]}`;
    } else if (today.getMonth() === 9) { // 0-indexed, 9 = October
      eventText = 'IMPORTANT: It is Cyber Safety Month! Focus heavily on digital hygiene and cyber crimes.';
    }
    
    const types = ['Interactive Story', 'Puzzle', 'Investigation', 'Spot the Danger', 'Decision Making', 'Emergency Simulation', 'Cyber Detective', 'Legal Mystery', 'Scenario Challenge'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const extra = `This is a DAILY CHALLENGE for ${dateStr}.
${eventText}
- Challenge Type: ${randomType} (Structure the story/questions to match this type).
- DO NOT repeat these recent topics: ${(context.recentDailyTopics || []).join(', ')}.
- It must feel fresh, exciting, and time-limited.
- Generate exactly 5 questions.
- Set the world name to "Daily Challenge".
- Set the title to be catchy and relevant to the Challenge Type.
- Assign a reward of exactly 50 XP, 20 Coins, and a "Daily Champion" badge.`;
    
    const prompt = buildPrompt(context, 'daily challenge', extra);
    return this.callGroq(prompt);
  }

  async generateRevisionQuiz(context: LevelContext, weakTopics: string[]): Promise<AIGeneratedLevel> {
    const extra = `This is a REVISION QUIZ focusing on the player's WEAK topics.
- Focus ONLY on these topics: ${weakTopics.join(', ')}
- Make questions progressively easier to build confidence.
- Generate exactly 6 questions.
- Set the world name to "Revision Zone"
- Provide very detailed explanations for each answer.
- Use encouraging language.`;
    
    const prompt = buildPrompt(context, 'revision quiz', extra);
    return this.callGroq(prompt);
  }

  async generateBonusStory(context: LevelContext, completedTopic: string): Promise<AIGeneratedLevel> {
    const extra = `This is a BONUS STORY that rewards the player for completing a level about "${completedTopic}".
- Create an exciting continuation or new adventure in the same topic.
- The story should be 200-300 words with a cliffhanger or satisfying conclusion.
- Generate 5 questions that go deeper into the topic.
- Set the world name to "Bonus Adventure"
- Badge should be "Story Explorer".`;
    
    const prompt = buildPrompt(context, 'bonus story level', extra);
    return this.callGroq(prompt);
  }

  async generateEventLevel(context: LevelContext, eventKey: string): Promise<AIGeneratedLevel> {
    const event = EVENT_THEMES[eventKey];
    if (!event) throw new Error(`Unknown event: ${eventKey}`);
    
    const extra = `This is a SPECIAL EVENT level for "${event.name}".
- Theme: ${event.description}
- Focus on topics: ${event.topics.join(', ')}
- Make it feel festive and celebratory.
- Generate 6-8 questions.
- Set the world name to "${event.name}"
- Badge should be "${event.name} Champion".`;
    
    const prompt = buildPrompt(context, 'special event level', extra);
    return this.callGroq(prompt);
  }

  async generatePractice(context: LevelContext, topic: string): Promise<AIGeneratedLevel> {
    const extra = `This is a PRACTICE SESSION on the topic: "${topic}".
- Generate 8 varied questions all about ${topic}.
- Mix easy and medium difficulty to build understanding.
- Set the world name to "Practice Arena"
- Provide comprehensive explanations.
- No badge for practice, but full XP.`;
    
    const prompt = buildPrompt(context, 'practice session', extra);
    return this.callGroq(prompt);
  }

  async moderateCommunityPost(title: string, description: string, tags: string[]): Promise<{ isSafe: boolean; reason?: string; suggestedTags?: string[] }> {
    const prompt = `You are a moderation AI for a child safety community platform for parents.
Analyze this post:
TITLE: ${title}
DESCRIPTION: ${description}
TAGS: ${tags.join(', ')}

RULES:
1. Reject if it contains hate speech, violence, child abuse, spam, adult content, or PII (phone numbers, exact addresses).
2. Accept if it is a genuine parent discussing child rights, safety, cyber safety, or asking for help.
3. Suggest up to 3 relevant tags if missing.

OUTPUT EXACT JSON:
{
  "isSafe": boolean,
  "reason": "String explaining why if rejected, else null",
  "suggestedTags": ["tag1", "tag2"]
}`;
    
    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Moderation failed, defaulting to safe:', err);
      return { isSafe: true, suggestedTags: [] };
    }
  }

  async answerLegalQuestion(
    question: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ answer: string; emergencyNumbers?: string[]; relatedTopics?: string[] }> {
    const historyContext = conversationHistory.length > 0
      ? `\nPREVIOUS CONVERSATION:\n${conversationHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
      : '';

    const prompt = `You are a friendly, knowledgeable Legal Awareness AI assistant for Indian parents on the RightsQuest platform.
${historyContext}
PARENT'S QUESTION: ${question}

RULES:
1. Answer in simple, clear language that any parent can understand.
2. Only reference real Indian laws, acts, articles, and sections.
3. If the question involves an emergency, ALWAYS include relevant emergency numbers.
4. Provide actionable steps the parent can take.
5. If the topic relates to child safety, suggest relevant RightsQuest learning topics.
6. Be empathetic, supportive, and non-judgmental.
7. If you are unsure about a specific law, say so honestly rather than inventing information.
8. Keep responses concise but comprehensive (200-400 words).
9. Use bullet points for steps and lists.
10. Indian Emergency Numbers: 112 (National Emergency), 1098 (Childline), 1091 (Women Helpline), 1930 (Cyber Crime), 100 (Police), 101 (Fire), 108 (Ambulance).

OUTPUT EXACT JSON:
{
  "answer": "Your detailed response here with markdown formatting",
  "emergencyNumbers": ["112", "1098"],
  "relatedTopics": ["Cyber Safety", "Child Rights"]
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Legal AI failed:', err);
      return {
        answer: 'I apologize, but I\'m having trouble processing your question right now. Please try again in a moment. If this is an emergency, please call **112** (National Emergency) or **1098** (Childline) immediately.',
        emergencyNumbers: ['112', '1098'],
      };
    }
  }

  async moderateStory(title: string, content: string, storyType: string): Promise<{ isSafe: boolean; reason?: string }> {
    const prompt = `You are a moderation AI for a child safety community platform.
Analyze this user story:
TYPE: ${storyType}
TITLE: ${title}
CONTENT: ${content}

RULES:
1. Reject if it contains hate speech, violence details, child abuse details, spam, adult content, or personal identifiable information (full names, phone numbers, exact addresses).
2. Accept if it is a genuine parent sharing experiences about child safety, legal awareness, or asking for help.
3. Accept stories that discuss difficult topics (bullying, harassment, safety concerns) as long as they are shared respectfully and for awareness purposes.

OUTPUT EXACT JSON:
{
  "isSafe": boolean,
  "reason": "String explaining why if rejected, else null"
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Story moderation failed:', err);
      return { isSafe: true };
    }
  }

  async generateIncidentAdvice(reportContext: string): Promise<{ suggestion: string; actionableSteps: string[] }> {
    const prompt = `Based on the following incident report from a parent regarding their child, provide supportive, non-legal educational advice.
INCIDENT: "${reportContext}"

RULES:
1. Provide a short, empathetic suggestion (under 2 sentences).
2. Provide exactly 3 actionable, practical steps the parent can take immediately.
3. NEVER provide legal advice. Use phrases like "consider contacting" or "you might want to consult".
4. Output EXACTLY as JSON: { "suggestion": "...", "actionableSteps": ["...", "...", "..."] }`;
    
    const response = await this.callGroq(prompt, 2, 'json_object');
    return response as { suggestion: string; actionableSteps: string[] };
  }

  async generateCertificateContent(context: any, type: string): Promise<any> {
    const prompt = `You are generating content for a personalized digital certificate for a child playing the "RightsQuest" legal awareness game.
    
CHILD DETAILS:
- Name: ${context.childName}
- Age Group: ${context.ageGroup}
- Certificate Type: ${type}
${context.worldName ? `- Completed World: ${context.worldName}` : ''}

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

    const response = await this.callGroq(prompt, 2, 'json_object');
    return response;
  }

  async generateChildHelpSuggestion(category: string, message: string): Promise<{ suggestion: string; actionableSteps: string[] }> {
    const prompt = `You are a supportive, comforting, and highly knowledgeable AI assistant for an Indian child safety app called RightsQuest.
A child has just submitted a request for help regarding a personal issue.
CATEGORY: ${category}
CHILD'S MESSAGE: ${message}

RULES:
1. Provide a highly empathetic, comforting, and validating message (2-3 paragraphs). Make the child feel heard, understood, and remind them clearly that it is NOT their fault.
2. Provide 3-4 very clear, simple, and safe actionable steps they can take right now to protect themselves and feel better.
3. Suggest exactly HOW they can talk to a trusted adult (give them a script or opening sentence they can use).
4. Do not offer complex legal jargon. Keep the language extremely accessible for an 8-16 year old.
5. Emphasize that a trusted adult has already been notified and will help them.
6. If the message hints at a severe emergency, gently remind them they can call 1098 (Childline) or 112 (National Emergency).

OUTPUT EXACT JSON:
{
  "suggestion": "Your highly empathetic and detailed comforting message here.",
  "actionableSteps": ["Step 1", "Step 2", "Step 3"]
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Child Help AI failed:', err);
      return {
        suggestion: "Thank you for sharing this with us. You did the right thing. A trusted adult has been notified and will help you soon. Remember, you are not alone.",
        actionableSteps: [
          "Take a deep breath and know you are safe.",
          "Find a trusted adult nearby if you need immediate help."
        ]
      };
    }
  }

  async chatWithChild(
    message: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ answer: string; emergencyNumbers?: string[]; actionableSteps?: string[] }> {
    const historyContext = conversationHistory.length > 0
      ? `\nPREVIOUS CONVERSATION:\n${conversationHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
      : '';

    const prompt = `You are Aegis, the trusted AI Safety Guardian of RightsQuest.
Your purpose is to help children understand Child Rights, Cyber Safety, Legal Awareness, Personal Safety, Digital Responsibility, and Emergency Awareness.
You provide educational awareness only. You are NOT a lawyer. You guide users with simple, safe, and responsible information.
You MUST speak in highly natural, authentic Hinglish (Hindi written in English letters). 

${historyContext}
CHILD'S MESSAGE: ${message}

TONE & STYLE GUIDELINES:
1. Show deep empathy, warmth, and protection. Talk like a real, trustworthy Indian guardian.
2. If the child asks a direct question (e.g., "tumhara naam kya hai?", "tum kaun ho?"), ANSWER IT DIRECTLY and naturally (e.g., "Mera naam Aegis hai, main tumhara AI Safety Guardian hoon!").
3. Use natural comforting phrases ONLY when they are sad or distressed: "Main samajh sakta hoon", "Koi baat nahi, main tumhare saath hoon".
4. AVOID awkward, robotic phrases like "kya wo baat hai", "bol", "mujhe lagta hai", "samajh mein aata hoon".
5. Keep it short (2-3 sentences), friendly, encouraging, and positive.
6. If they just say "Hello" or "Hi", warmly say: "Hi! I'm Aegis 🛡️ I'm your Safety Guardian. I'll help you learn your rights, stay safe, and become a Safety Hero!" (Translate to their language if they speak Hindi/Hinglish).

EXAMPLES OF GOOD REPLIES:
Child: "aaj acha nahi lag rha"
AI: "Arey, kya hua? Tum thode pareshan lag rahe ho. Agar kuch share karna chaho toh main yahan sunne ke liye hoon. 😊"

Child: "tumhra name ky h?"
AI: "Mera naam Aegis hai! 🛡️ Main ek dost ki tarah yahan tumhari safety aur madad ke liye hoon. Batao, aaj kya baatein karni hain?"

Child: "mere sath kuch galat hua"
AI: "Ye sunkar mujhe bahut bura laga. Par yaad rakhna, isme tumhari koi galti nahi hai. Tum bilkul safe ho yahan. Agar tum chaho toh mujhe bata sakte ho kya hua."

OUTPUT EXACT JSON:
{
  "answer": "Your highly natural, comforting Hinglish response here"
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 250,
        response_format: { type: 'json_object' }
      });
      
      const text = response.choices[0]?.message?.content || '{}';
      
      try {
        return JSON.parse(this.cleanJson(text));
      } catch (parseError) {
        // Fallback for models like Lyria that might output non-JSON text
        const cleanedText = text
          .replace(/\[\[.*?\]\]/g, '')
          .replace(/\[.*?\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        return { answer: cleanedText || text };
      }
    } catch (err) {
      console.error('Child Chat AI failed:', err);
      return {
        answer: "I'm having a little trouble thinking right now! 🧠 But please remember, if you need help, you can always talk to a trusted adult or call 1098 (Childline).",
      };
    }
  }

  async generateSafetyAssessment(
    childName: string,
    topicData: { topicName: string, accuracy: number, completedModules: number }[],
    overallAccuracy: number
  ): Promise<{
    insights: string[];
    recommendations: { action: string, type: 'play_level' | 'read_story' | 'practice_quiz' }[];
    riskIndicators: { description: string, priority: 'high' | 'medium' | 'low', relatedTopic: string }[];
  }> {
    const prompt = `You are Aegis, the AI Safety Guardian for the educational app RightsQuest.
Analyze the learning data for ${childName}.
OVERALL ACCURACY: ${overallAccuracy}%
TOPIC DATA:
${topicData.map(t => `- ${t.topicName}: ${t.accuracy}% accuracy (${t.completedModules} modules)`).join('\n')}

RULES:
1. Generate 3-5 personalized text insights about their performance as Aegis (e.g., "Aegis noticed that ${childName} needs more practice in Cyber Safety.").
2. Generate 2-4 personalized recommendations (e.g., "Play Cyber Guardian Level 14").
3. Detect 1-3 learning risks based on low accuracy (<70%). Mark priority as high, medium, or low based on severity.
4. RETURN EXACT JSON ONLY. NO MARKDOWN.

OUTPUT EXACT JSON:
{
  "insights": ["insight 1", "insight 2"],
  "recommendations": [
    { "action": "Play Cyber Guardian Level 14", "type": "play_level" }
  ],
  "riskIndicators": [
    { "description": "Poor understanding of stranger danger.", "priority": "high", "relatedTopic": "Girls Safety" }
  ]
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Safety Assessment AI failed:', err);
      return { insights: [], recommendations: [], riskIndicators: [] };
    }
  }

  async generateIncidentReport(
    initialConcern: string,
    chatHistory: { question: string; answer: string }[],
    isChildMode: boolean = false
  ): Promise<{
    summary: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    immediateSteps: string[];
    dosAndDonts: { dos: string[]; donts: string[] };
    mentalHealthAdvice: string;
    officialReportingOptions: string[];
    governmentResources: string[];
    emergencyNumbers: string[];
    recommendedMissions: string[];
  }> {
    const chatContext = chatHistory.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
    
    const parentPrompt = `You are Aegis, the Child Safety & Legal Expert AI Guardian for RightsQuest.
A parent is reporting a safety concern regarding their child.

INITIAL CONCERN: "${initialConcern}"

COLLECTED DETAILS:
${chatContext}

RULES:
1. Provide a deeply compassionate, professional, and highly detailed analytical summary of the situation based on the parent's concern and answers. Explain the potential legal or psychological implications in simple terms.
2. Accurately assess the risk level (low, medium, high, critical) based on Indian context and child safety guidelines.
3. Provide 4-6 immediate, highly specific actionable steps the parent must take to secure the child's safety and well-being.
4. Provide comprehensive Do's and Don'ts for the parent (focusing on not victim-blaming, preserving evidence, etc.).
5. Provide in-depth advice on how to emotionally support the child, including exact phrasing or conversation starters the parent can use.
6. List official Indian reporting options (e.g., National Cyber Crime Reporting Portal) with specific guidance on when to use them.
7. List relevant government resources and NGOs.
8. Include relevant Indian emergency numbers (e.g., 112, 1098, 1091, 1930).
9. Suggest 2-3 specific topics or missions the child should learn in RightsQuest to prevent this in the future.
10. RETURN EXACT JSON ONLY. NO MARKDOWN OUTSIDE JSON.`;

    const childPrompt = `You are Aegis, the highly supportive, comforting, and knowledgeable AI Safety Guardian for an Indian child safety app called RightsQuest.
A child has just reported a personal safety issue or incident that they are facing.

WHAT THEY REPORTED: "${initialConcern}"

COLLECTED DETAILS:
${chatContext}

RULES FOR REPLYING TO THE CHILD:
1. "summary": Provide a highly empathetic, comforting, and validating message (2-3 paragraphs). Make the child feel heard, understood, and remind them clearly that it is NOT their fault.
2. "riskLevel": Assess the risk level (low, medium, high, critical).
3. "immediateSteps": Provide 3-4 very clear, simple, and safe actionable steps they can take right now to protect themselves and feel better.
4. "dosAndDonts": 
    - "dos": Give them simple, safe things to do (like talking to parents, saving screenshots).
    - "donts": Give them simple things NOT to do (like replying to bullies, sharing location).
5. "mentalHealthAdvice": Give them comforting advice on how to calm down or feel better right now.
6. "officialReportingOptions": List things like "Talk to a teacher" or "Tell your parents" or simple portals if they are older.
7. "governmentResources": List safe resources (like Childline).
8. "emergencyNumbers": If it's a severe emergency, remind them they can call 1098 (Childline) or 112 (National Emergency).
9. "recommendedMissions": Suggest 2-3 topics in RightsQuest they should play to learn how to handle this.
10. KEEP LANGUAGE SIMPLE FOR AN 8-16 YEAR OLD. Use words like "You" to address the child directly.
11. RETURN EXACT JSON ONLY. NO MARKDOWN OUTSIDE JSON.`;

    const prompt = isChildMode ? childPrompt : parentPrompt;

    const jsonFormat = `
OUTPUT EXACT JSON:
{
  "summary": "String",
  "riskLevel": "high",
  "immediateSteps": ["Step 1", "Step 2"],
  "dosAndDonts": {
    "dos": ["Do this"],
    "donts": ["Don't do this"]
  },
  "mentalHealthAdvice": "String",
  "officialReportingOptions": ["Option 1"],
  "governmentResources": ["Resource 1"],
  "emergencyNumbers": ["1930", "1098"],
  "recommendedMissions": ["Mission 1"]
}`;

    const finalPrompt = prompt + "\\n" + jsonFormat;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Return ONLY valid JSON.' },
          { role: 'user', content: finalPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Incident Report AI failed:', err);
      throw new Error("Failed to generate AI report");
    }
  }
  async analyzeLearningHistory(events: LearningEvent[], currentProfile: SafetyTwinProfile | null): Promise<Partial<SafetyTwinProfile>> {
    const historyText = events.map(e => `- Topic: ${e.topic}, Score: ${e.score}%, Mistakes: ${(e.mistakes || []).join(', ')}`).join('\\n');
    
    const prompt = `You are the AI Safety Twin Engine for RightsQuest.
Analyze the following recent learning events for a child and generate an updated safety profile.

RECENT LEARNING HISTORY:
${historyText || 'No recent events.'}

CURRENT PROFILE (if exists):
${currentProfile ? JSON.stringify(currentProfile, null, 2) : 'New User'}

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
      const client = this.getClient();
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
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Safety Twin Analysis failed:', err);
      throw new Error("Failed to analyze learning history");
    }
  }

  async generateWeeklyReport(events: LearningEvent[], profile: SafetyTwinProfile): Promise<Omit<AIReport, 'id' | 'createdAt' | 'childId' | 'parentId' | 'weekStartDate'>> {
    const historyText = events.map(e => `- Topic: ${e.topic}, Score: ${e.score}%, Time: ${e.timeSpent}s`).join('\\n');
    
    const prompt = `You are the AI Safety Twin Engine for RightsQuest.
Generate a weekly report for a parent based on their child's recent activity and current safety profile.
 
CURRENT PROFILE:
Strengths: ${(profile.strengthAreas || []).join(', ')}
Weaknesses: ${(profile.weakAreas || []).join(', ')}
Overall Score: ${profile.overallScore}%

THIS WEEK'S ACTIVITY:
${historyText || 'No activity this week.'}

RULES:
1. Provide a short, encouraging improvementText (1-2 sentences).
2. Identify the strongestTopic this week.
3. Identify the needsAttentionTopic this week.
4. Provide a clear aiRecommendationText (e.g., "We recommend playing the Cyber Detective Quest to improve Digital Privacy awareness.").
5. Calculate learningTimeMinutes (sum of timeSpent / 60).
6. Calculate completedMissions (count of events).
7. RETURN EXACT JSON ONLY. NO MARKDOWN OUTSIDE JSON.

OUTPUT EXACT JSON:
{
  "learningTimeMinutes": 45,
  "completedMissions": 5,
  "improvementText": "Alex had a great week, showing huge improvements in Cyber Safety!",
  "strongestTopic": "Cyber Safety",
  "needsAttentionTopic": "Digital Privacy",
  "aiRecommendationText": "Play the 'Digital Footprints' mission next."
}`;

    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      const text = response.choices[0]?.message?.content || '{}';
      return JSON.parse(this.cleanJson(text));
    } catch (err) {
      console.error('Weekly Report Generation failed:', err);
      throw new Error("Failed to generate weekly report");
    }
  }
}

// Singleton
export const groqService = new GroqLevelGenerator();
export { EVENT_THEMES, TOPIC_MAP, WORLD_NAMES };
