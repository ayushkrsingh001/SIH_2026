const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY || 'YOUR_API_KEY', dangerouslyAllowBrowser: true });

async function test() {
  const prompt = `You are a Child Safety & Legal Expert AI for RightsQuest.
A parent is reporting a safety concern regarding their child.

INITIAL CONCERN: "My child is being bullied online on Instagram."

COLLECTED DETAILS:
Q: How old is the child involved?
A: 12

Q: Where did this happen?
A: Instagram

RULES:
1. Provide a compassionate, professional, and educational summary of the situation.
2. Assess the risk level (low, medium, high, critical).
3. Provide 3-5 immediate actionable steps.
4. Provide Do's and Don'ts for the parent.
5. Provide specific advice on how to emotionally support the child.
6. List official Indian reporting options (e.g., National Cyber Crime Reporting Portal).
7. List relevant government resources.
8. Include relevant Indian emergency numbers (e.g., 112, 1098, 1091, 1930).
9. Suggest 2-3 topics the child should learn in RightsQuest.
10. RETURN EXACT JSON ONLY. NO MARKDOWN OUTSIDE JSON.

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

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    console.log(response.choices[0].message.content);
  } catch (e) {
    console.error(e);
  }
}

test();
