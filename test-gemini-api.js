#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT FOUND');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('🌐 URL:', url);

    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Hello, this is a simple test. Respond with 'OK' if you are working.",
            },
          ],
        },
      ],
    };

    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📊 Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success Response:', JSON.stringify(data, null, 2));

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('💬 Generated Text:', content);
  } catch (error) {
    console.error('💥 Exception:', error);
  }
}

testGeminiAPI();
