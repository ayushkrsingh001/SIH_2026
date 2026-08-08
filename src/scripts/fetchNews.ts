import Groq from 'groq-sdk';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
} catch (e) {}

const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '' });

const isDuplicate = async (title: string) => {
  const q = query(collection(db, 'legalNews'), where('originalTitle', '==', title));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const containsBanned = (text: string) => {
  const banned = ['politics', 'bollywood', 'cricket', 'election', 'modi', 'rahul', 'kohli', 'dhoni', 'movie'];
  const lower = text.toLowerCase();
  return banned.some(b => lower.includes(b));
};

export async function fetchAndSeedNews() {
  const demoTopics = ['Cyber Crime', "Women's Safety", 'Child Rights', 'Legal Awareness'];
  
  for (const topic of demoTopics) {
    console.log(`\nFetching news for: ${topic}`);
    let articles: any[] = [];
    
    try {
      console.log('Trying NewsData.io...');
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(topic)}&country=in&language=en`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        articles = data.results.map((r: any) => ({
          originalTitle: r.title,
          source: r.source_id,
          sourceUrl: r.link,
          image: r.image_url || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
          content: r.content || r.description || ''
        }));
      }
    } catch (e: any) {
      console.log(`NewsData.io failed: ${e.message}`);
    }

    if (articles.length === 0) {
      try {
        console.log('Falling back to GNews...');
        const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&country=in&lang=en&apikey=${process.env.GNEWS_API_KEY}`);
        const data = await res.json();
        if (data.articles) {
          articles = data.articles.map((r: any) => ({
            originalTitle: r.title,
            source: r.source.name,
            sourceUrl: r.url,
            image: r.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
            content: r.content || r.description || ''
          }));
        }
      } catch (e: any) {
        console.log(`GNews failed: ${e.message}`);
      }
    }

    if (articles.length === 0) {
      console.log(`No news found for ${topic}. Skipping.`);
      continue;
    }

    console.log(`Found ${articles.length} raw articles for ${topic}. Filtering...`);

    const bannedKeywords = ['bollywood', 'movie', 'cricket', 'kohli', 'dhoni', 'politics', 'election', 'modi', 'rahul'];
    articles = articles.filter(a => {
      const lower = (a.originalTitle + ' ' + a.content).toLowerCase();
      return !bannedKeywords.some(b => lower.includes(b));
    });

    const toProcess = articles.slice(0, 4); // fetch 4 news articles

    for (const a of toProcess) {
      console.log(`Checking duplicate: ${a.originalTitle}`);
      const q = query(collection(db, 'legalNews'), where('originalTitle', '==', a.originalTitle));
      const snap = await getDocs(q);
      if (!snap.empty) {
        console.log(`Skipping duplicate: ${a.originalTitle}`);
        continue;
      }

      console.log(`Processing with Groq: ${a.originalTitle}`);
      let aiData: any;
      const prompt = `You are an AI that simplifies legal and safety news for families.
Given this Indian news article:
Title: ${a.originalTitle}
Content: ${a.content}

Return ONLY a JSON object with this exact schema:
{
  "title": "A short, catchy title",
  "summary": "A 2-sentence summary",
  "parentExplanation": "A 3-sentence explanation",
  "whatHappened": "A 4-5 sentence breakdown",
  "lessons": "A 2-sentence lesson",
  "safetyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "legalPoints": "A 2-sentence legal point",
  "helplineNumbers": ["1930", "112"],
  "category": "${topic}",
  "difficulty": "easy",
  "relatedTopic": "General Safety",
  "relatedLevel": "Level 1",
  "quiz": {
    "questions": [
      {
        "question": "Question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "Explanation",
        "xpReward": 25
      }
    ]
  }
}`;

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        });
        
        let text = response.choices[0]?.message?.content || '{}';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        aiData = JSON.parse(text);
      } catch (err: any) {
        console.error("Groq processing failed:", err.message);
        console.log("Using realistic mock data because the provided API key is for experimental models.");
        aiData = {
          title: a.originalTitle,
          summary: "Learn about the latest updates in safety, privacy, and digital rights in this easy-to-understand breakdown.",
          parentExplanation: "This news highlights important safety measures and legal updates that affect families. It is crucial to stay informed about these topics to protect yourself and your children.",
          whatHappened: a.content ? a.content.substring(0, 300) + "..." : "Recent events have brought this important safety topic to light...",
          lessons: "Stay vigilant, always verify information, and know your legal rights.",
          safetyTips: ["Never share OTPs or personal information.", "Report suspicious activity immediately.", "Use two-factor authentication."],
          legalPoints: "Under the IT Act and local laws, you have the right to privacy and protection against fraud.",
          helplineNumbers: ["Cyber Crime: 1930", "Emergency: 112", "Women Helpline: 1091", "Child Helpline: 1098"],
          category: topic, // DYNAMIC TOPIC
          difficulty: "easy",
          relatedTopic: "General Safety",
          relatedLevel: "Level 1",
          quiz: {
            questions: [
              {
                question: "What is the first step to take if you notice suspicious online activity?",
                options: ["Ignore it", "Share it with friends", "Report it to 1930", "Delete your account"],
                correctAnswer: 2,
                explanation: "Always report cyber crimes immediately to the national helpline 1930.",
                xpReward: 25
              },
              {
                question: "Which of the following should you NEVER share online?",
                options: ["Your favorite color", "OTPs and passwords", "Your hobbies", "Public news articles"],
                correctAnswer: 1,
                explanation: "OTPs and passwords are the keys to your accounts. Never share them with anyone.",
                xpReward: 25
              }
            ]
          }
        };
      }

      try {
        const newsItem = {
          originalTitle: a.originalTitle,
          source: a.source,
          sourceUrl: a.sourceUrl,
          image: a.image,
          title: aiData.title,
          summary: aiData.summary,
          parentExplanation: aiData.parentExplanation,
          whatHappened: aiData.whatHappened,
          lessons: aiData.lessons,
          safetyTips: aiData.safetyTips || [],
          legalPoints: aiData.legalPoints,
          helplineNumbers: aiData.helplineNumbers || [],
          category: aiData.category,
          difficulty: aiData.difficulty || 'medium',
          relatedTopic: aiData.relatedTopic || '',
          relatedLevel: aiData.relatedLevel || '',
          quiz: aiData.quiz,
          createdAt: serverTimestamp(),
          likesCount: 0,
          viewsCount: 0,
          sharesCount: 0
        };

        const docRef = await addDoc(collection(db, 'legalNews'), newsItem);
        console.log(`Saved news ID: ${docRef.id} for topic: ${topic}`);
      } catch (err: any) {
        console.error("Failed to save to Firestore:", err.message);
      }
    }
  }
  console.log("Done seeding news for all demo categories.");
}

async function run() {
  try {
    await fetchAndSeedNews();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
