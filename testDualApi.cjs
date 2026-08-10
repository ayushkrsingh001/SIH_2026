// No dotenv
const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;

async function testGroq() {
  console.log('Testing Groq API...');
  if (!GROQ_API_KEY) throw new Error('No Groq API Key found');
  
  const client = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a test bot. Return valid JSON.' },
      { role: 'user', content: 'Say hello in JSON format: {"message": "hello"}' }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
  
  console.log('Groq Response:', response.choices[0]?.message?.content);
  console.log('✅ Groq API is working perfectly.\n');
}

async function testOpenRouter() {
  console.log('Testing OpenRouter API...');
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    throw new Error('No valid OpenRouter API Key found');
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
        { role: 'system', content: 'You are a test bot. Return valid JSON.' },
        { role: 'user', content: 'Say hello in JSON format: {"message": "hello"}' }
      ],
      response_format: { type: 'json_object' }
    })
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter Error ${res.status}: ${errText}`);
  }
  
  const data = await res.json();
  console.log('OpenRouter Response:', data.choices[0]?.message?.content);
  console.log('✅ OpenRouter API is working perfectly.\n');
}

async function runTests() {
  try {
    await testGroq();
  } catch (e) {
    console.error('❌ Groq test failed:', e.message);
  }

  try {
    await testOpenRouter();
  } catch (e) {
    console.error('❌ OpenRouter test failed:', e.message);
  }
}

runTests();
