async function testOpenRouter() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'user', content: 'test' }
        ],
        temperature: 0.7,
        max_tokens: 250,
      })
    });

    if (!res.ok) {
      console.log('Error status:', res.status);
      const text = await res.text();
      console.log('Error body:', text);
      return;
    }

    const data = await res.json();
    console.log('Success:', data.choices[0].message.content);
  } catch(e) {
    console.error("Error caught:", e);
  }
}

testOpenRouter();
