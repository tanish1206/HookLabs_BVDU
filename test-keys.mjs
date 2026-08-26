import fs from 'fs';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/Hooklabs/HookLabs_/.env.local' });

async function testGroq() {
  console.log('Testing Groq Key...');
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say hello in 1 word' }],
      max_tokens: 10,
    });
    console.log('Groq ✅:', completion.choices[0].message.content);
  } catch (err) {
    console.error('Groq ❌:', err.message);
  }
}

async function testElevenLabs() {
  console.log('Testing ElevenLabs Key...');
  try {
    const voiceId = '9BWtsMINqrJLrRacOk9x'; // Aria
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        model_id: 'eleven_flash_v2_5',
      }),
    });
    if (res.ok) {
      console.log('ElevenLabs ✅: Success (Audio bytes returned)');
    } else {
      console.error('ElevenLabs ❌:', res.status, await res.text());
    }
  } catch (err) {
    console.error('ElevenLabs ❌:', err.message);
  }
}

async function run() {
  await testGroq();
  await testElevenLabs();
}

run();
