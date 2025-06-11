// Simple test to verify API keys work
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing API Key Configuration...');
console.log('');

// Check if all API keys are present
const keys = {
  'Anthropic (Claude)': process.env.ANTHROPIC_API_KEY,
  'OpenAI (GPT-4)': process.env.OPENAI_API_KEY,
  'Google (Gemini)': process.env.GOOGLE_API_KEY,
  'Together (Llama)': process.env.TOGETHER_API_KEY
};

let allKeysPresent = true;

for (const [service, key] of Object.entries(keys)) {
  if (key) {
    console.log(`✅ ${service}: Key found (${key.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${service}: Key missing`);
    allKeysPresent = false;
  }
}

console.log('');
if (allKeysPresent) {
  console.log('🎉 All API keys configured! Ready to test LLM connections.');
} else {
  console.log('⚠️ Some API keys are missing. Please add them to .env.local');
}
