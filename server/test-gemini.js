const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Say "hello" and nothing else.',
    });
    console.log('✅ SUCCESS — Gemini replied:', response.text);
  } catch (err) {
    console.error('❌ FAILED —', err.message);
    process.exit(1);
  }
}

main();
