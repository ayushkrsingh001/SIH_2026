import { allLocalModules, getLocalScenes } from '../data';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

async function translateBatch(items: any[]): Promise<any[]> {
  const prompt = `You are a professional English to Hindi translator. Translate the given JSON object containing a list of items into Hindi.
  Only translate textual properties intended for display, such as: title, description, text, scenario, educationalTip, relatedLegalInfo, feedbackText, and the "text" field inside choices/sequenceItems.
  DO NOT translate IDs, categories (like "Child Rights", "Mental Wellbeing"), keys/property names, or any URLs.
  Output ONLY valid JSON with the exact same structure as the input, under the key "items".
  
  Input:
  ${JSON.stringify({ items }, null, 2)}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant', // fast and capable
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return parsed.items || items;
    }
  } catch (err) {
    console.error('Translation batch failed:', err);
  }
  return items; // fallback to original if failed
}

async function run() {
  console.log('Starting translation...');
  
  // 1. Translate Modules
  console.log(`Translating ${allLocalModules.length} modules...`);
  const translatedModules = [];
  // Batch by 10
  for (let i = 0; i < allLocalModules.length; i += 10) {
    console.log(`Batch ${i/10 + 1} / ${Math.ceil(allLocalModules.length/10)}`);
    const batch = allLocalModules.slice(i, i + 10);
    const res = await translateBatch(batch);
    translatedModules.push(...res);
  }

  // Save to locale folder
  const localeDir = path.resolve(process.cwd(), 'src/data/locales/hi');
  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
  }

  fs.writeFileSync(path.join(localeDir, 'modules.json'), JSON.stringify(translatedModules, null, 2));
  fs.writeFileSync(path.join(localeDir, 'scenes.json'), JSON.stringify({}, null, 2)); // Empty as unused

  console.log('Translation complete!');
}

run().catch(console.error);
