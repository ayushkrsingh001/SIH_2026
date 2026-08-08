import Groq from 'groq-sdk';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
    }
  });
}

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
const NEWSDATA_API_KEY = 'pub_9a58ba7288b24acaadd1dfed86c8c666';

if (!GROQ_API_KEY) {
  console.error("VITE_GROQ_API_KEY is not set in environment.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

const KEYWORDS = ["Child Rights", "Cyber Safety", "Online Fraud", "Digital Privacy"];

async function run() {
  try {
    const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    console.log(`Fetching news for: ${keyword}`);
    
    const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(keyword)}&country=in&language=en`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      console.log("No news found.");
      return;
    }
    
    console.log(`Found ${data.results.length} articles. Processing first 3...`);
    const articles = data.results.slice(0, 3);
    

    
    for (const a of articles) {
      console.log(`Processing: ${a.title}`);
      const prompt = `You are an AI that simplifies legal and safety news for families.
Given this news article:
Title: ${a.title}
Content: ${a.content || a.description || ''}

Return a valid JSON object matching this schema exactly:
{
  "title": "A catchy, simple title",
  "summary": "Child-friendly summary",
  "whatHappened": "Detailed explanation",
  "lessons": "What can we learn?",
  "safetyTips": ["tip 1", "tip 2"],
  "legalAwareness": "What laws apply here",
  "emergencyNumbers": ["100", "112"],
  "quizQuestion": "A multiple choice question to test understanding",
  "quizOptions": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "quizCorrectAnswer": 0
}
Output only the raw JSON, no markdown blocks.`;
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      let text = response.choices[0]?.message?.content || '{}';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(text);
      
      const newsItem = {
        title: aiData.title,
        summary: aiData.summary,
        whatHappened: aiData.whatHappened,
        lessons: aiData.lessons,
        safetyTips: aiData.safetyTips,
        legalAwareness: aiData.legalAwareness,
        emergencyNumbers: aiData.emergencyNumbers,
        sourceUrl: a.link,
        imageUrl: a.image_url,
        publishedAt: Timestamp.now(), // Fallback
        likesCount: 0,
        viewsCount: 0,
        sharesCount: 0,
        tags: [keyword.toLowerCase().replace(' ', '_')],
        createdAt: Timestamp.now(),
        aiGenerated: true
      };
      
      const docRef = await addDoc(collection(db, 'legalNews'), newsItem);
      console.log(`Saved news ID: ${docRef.id}`);
      
      const quizItem = {
        newsId: docRef.id,
        questions: [{
          id: 'q1',
          question: aiData.quizQuestion,
          options: aiData.quizOptions,
          correctOptionId: aiData.quizCorrectAnswer,
          explanation: aiData.lessons,
          xpReward: 50
        }],
        totalXP: 50
      };
      
      await addDoc(collection(db, 'newsQuiz'), quizItem);
      console.log(`Saved quiz for news ID: ${docRef.id}`);
    }
    
    console.log("Done seeding news.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
