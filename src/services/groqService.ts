import Groq from 'groq-sdk';
import type { AIGeneratedLevel, LevelContext } from '../types';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const SYSTEM_INSTRUCTION = `You are an educational game content generator for "RightsQuest", an Indian legal awareness game for children aged 8-16.

RULES:
1. Return ONLY valid JSON. No markdown, no explanations, no extra text.
2. All content must be safe, educational, age-appropriate, and legally accurate for India.
3. Never invent laws. Only use real Indian laws, acts, and constitutional articles.
4. Use official Indian emergency numbers: 112 (National Emergency), 1098 (Childline), 1091 (Women Helpline), 1930 (Cyber Crime), 100 (Police), 101 (Fire), 108 (Ambulance).
5. No violence, political bias, religious bias, graphic content, or frightening descriptions.
6. Characters should be relatable Indian children with realistic scenarios.
7. Stories should naturally lead into the questions.
8. Never repeat the same question, story, or character name within a session.

QUESTION TYPES YOU CAN USE:
- "mcq": Multiple choice with 4 options
- "true_false": True or false statement
- "decision": A scenario where the player must choose the best action
- "order_sequence": Arrange steps in the correct order (provide items as options)
- "scenario": Analyze a situation and pick the safest/legal response
- "spot_danger": Identify the dangerous element in a described situation

DIFFICULTY GUIDELINES:
- Easy (age 8-10): Simple words, short sentences, basic concepts
- Medium (age 11-13): Moderate vocabulary, real-world scenarios
- Hard (age 14-16): Advanced legal concepts, nuanced situations
- Expert: Complex multi-layered scenarios

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
      "type": "<mcq|true_false|decision|order_sequence|scenario|spot_danger>",
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
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private async callGroq(userPrompt: string, retries = 2): Promise<AIGeneratedLevel> {
    const client = this.getClient();

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: 'json_object' }
        });

        const text = response.choices[0]?.message?.content || '{}';
        
        // Parse and validate
        const parsed = JSON.parse(this.cleanJson(text)) as AIGeneratedLevel;
        this.validateLevel(parsed);
        return parsed;
      } catch (err) {
        console.error(`Groq attempt ${attempt + 1} failed:`, err);
        if (attempt === retries) {
          throw new Error(`Failed to generate level after ${retries + 1} attempts: ${err}`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    throw new Error('Unreachable');
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
      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        throw new Error('MCQ question must have at least 2 options');
      }
    }
    if (!level.reward || typeof level.reward.xp !== 'number') {
      throw new Error('Invalid reward structure');
    }
  }

  async generateLevel(context: LevelContext): Promise<AIGeneratedLevel> {
    const prompt = buildPrompt(context, 'playable educational level');
    return this.callGroq(prompt);
  }

  async generateDailyChallenge(context: LevelContext): Promise<AIGeneratedLevel> {
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const extra = `This is a DAILY CHALLENGE for ${today}.
- Make it themed around the current day or a general awareness topic.
- It should feel special and time-limited.
- Generate exactly 5 quick-fire questions.
- Set the world name to "Daily Challenge"
- Badge should be "Daily Champion" if score is 100%.`;
    
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
}

// Singleton
export const groqService = new GroqLevelGenerator();
export { EVENT_THEMES, TOPIC_MAP, WORLD_NAMES };
