import axios from 'axios';
import { processNewsArticle } from './groqProcessor';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Keywords to focus purely on awareness, safety, and rights
const KEYWORDS = [
  "Child Rights", "Women's Safety", "Cyber Safety", "Cyber Crime", 
  "Online Fraud", "Consumer Rights", "Road Safety", "Digital Privacy", 
  "Self Defence", "Police Awareness", "Child Protection", "Human Trafficking",
  "Bullying", "Internet Safety", "Constitution", "Legal Awareness"
];

function getRandomKeyword() {
  return KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
}

interface FetchedArticle {
  title: string;
  description: string;
  content: string;
  link: string;
  image_url: string;
  source_id: string;
  pubDate: string | Date;
  category: string[];
}

async function fetchFromNewsData(keyword: string, apiKey: string): Promise<FetchedArticle[]> {
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(keyword)}&country=in&language=en`;
  console.log(`Fetching from NewsData.io with keyword: ${keyword}`);
  
  const response = await axios.get(url);
  const articles = response.data.results || [];
  
  return articles.map((a: any) => ({
    title: a.title || '',
    description: a.description || '',
    content: a.content || a.description || a.title || '',
    link: a.link || '',
    image_url: a.image_url || '',
    source_id: a.source_id || 'NewsData',
    pubDate: a.pubDate,
    category: a.category || []
  }));
}

async function fetchFromGNews(keyword: string, apiKey: string): Promise<FetchedArticle[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keyword)}&country=in&lang=en&apikey=${apiKey}`;
  console.log(`Fallback to GNews with keyword: ${keyword}`);
  
  const response = await axios.get(url);
  const articles = response.data.articles || [];
  
  return articles.map((a: any) => ({
    title: a.title || '',
    description: a.description || '',
    content: a.content || a.description || a.title || '',
    link: a.url || '',
    image_url: a.image || '',
    source_id: a.source?.name || 'GNews',
    pubDate: a.publishedAt,
    category: [] // GNews doesn't provide category arrays like NewsData
  }));
}

export async function fetchAndProcessNews() {
  const newsDataKey = process.env.NEWSDATA_API_KEY;
  const gnewsKey = process.env.GNEWS_API_KEY;
  
  if (!newsDataKey && !gnewsKey) {
    console.error("Missing both NEWSDATA_API_KEY and GNEWS_API_KEY in environment variables.");
    return;
  }

  const keyword = getRandomKeyword();
  let articles: FetchedArticle[] = [];

  try {
    if (newsDataKey) {
      try {
        articles = await fetchFromNewsData(keyword, newsDataKey);
      } catch (err) {
        console.error("NewsData API failed:", err);
      }
    }

    // Fallback to GNews if NewsData fails or returns nothing
    if ((!articles || articles.length === 0) && gnewsKey) {
      try {
        articles = await fetchFromGNews(keyword, gnewsKey);
      } catch (err) {
        console.error("GNews API failed:", err);
      }
    }

    if (articles.length === 0) {
      console.log(`Both APIs failed or returned no results for keyword: ${keyword}`);
      return; // Will silently fail and UI will just show previously cached Firestore news
    }

    // Process top 3 articles to avoid blowing through Gemini quotas
    const articlesToProcess = articles.slice(0, 3);
    
    for (const article of articlesToProcess) {
      // 1. Check for duplicates in DB based on URL
      const existing = await db.collection('legalNews')
        .where('originalUrl', '==', article.link)
        .limit(1)
        .get();
      
      if (!existing.empty) {
        console.log(`Skipping duplicate article: ${article.title}`);
        continue;
      }

      // 2. Filter out explicit junk
      const categories = article.category || [];
      if (categories.includes('politics') || categories.includes('entertainment') || categories.includes('sports')) {
        console.log(`Skipping article due to category: ${article.title}`);
        continue;
      }

      // 3. Process with Gemini
      console.log(`Processing article: ${article.title}`);
      
      try {
        const aiData = await processNewsArticle(article.title, article.description, article.content);
        
        // 4. Save to Firestore
        const newsData = {
          title: aiData.title,
          summary: aiData.summary,
          whatHappened: aiData.whatHappened,
          lessons: aiData.lessons,
          safetyTips: aiData.safetyTips,
          legalAwareness: aiData.legalAwareness,
          emergencyNumbers: aiData.emergencyNumbers || [],
          relatedTopic: aiData.relatedTopic || 'General Safety',
          suggestedLevelId: aiData.suggestedLevelId || '',
          difficulty: aiData.difficulty,
          readTimeMinutes: aiData.readTimeMinutes || 3,
          rewardXP: aiData.rewardXP || 20,
          badgeRecommendation: aiData.badgeRecommendation || '',
          imageUrl: article.image_url || '',
          source: article.source_id,
          originalUrl: article.link,
          categoryId: 'news',
          publishedAt: admin.firestore.Timestamp.fromDate(new Date(article.pubDate || Date.now())),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          viewsCount: 0,
          likesCount: 0,
          commentsCount: 0,
          bookmarksCount: 0,
        };

        const newsRef = await db.collection('legalNews').add(newsData);
        
        // Save the quiz separately
        if (aiData.quizQuestions && aiData.quizQuestions.length > 0) {
          const totalXP = aiData.quizQuestions.length * 10;
          await db.collection('newsQuiz').add({
            newsId: newsRef.id,
            questions: aiData.quizQuestions,
            totalXP: totalXP
          });
        }
        
        console.log(`Successfully processed and saved news: ${newsRef.id}`);
      } catch (geminiError) {
        console.error(`Gemini failed to process article ${article.title}:`, geminiError);
      }
    }
  } catch (error) {
    console.error("Critical error in fetchAndProcessNews:", error);
  }
}
