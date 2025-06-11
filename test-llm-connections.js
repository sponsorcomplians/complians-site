/**
 * UKVI Compliance Platform - LLM Connection Tester
 * Tests actual connections to all LLM providers
 */

require('dotenv').config({ path: '.env.local' });

// Import LLM libraries
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Together = require('together-ai');

const TEST_MESSAGE = "Test connection. Respond with 'Connection successful' and nothing else.";

console.log('🧠 UKVI Compliance Platform - LLM Connection Tester');
console.log('=================================================');
console.log('');

// Test all LLM connections
async function testAllConnections() {
  const results = {
    claude: await testClaude(),
    gpt4: await testGPT4(),
    gemini: await testGemini(),
    llama: await testLlama()
  };

  // Print summary
  console.log('');
  console.log('📊 Connection Test Summary');
  console.log('------------------------');
  
  let allSuccessful = true;
  for (const [name, result] of Object.entries(results)) {
    const status = result.success 
      ? '✅ CONNECTED' 
      : '❌ FAILED';
    
    console.log(`${status} - ${name.toUpperCase()}`);
    
    if (!result.success) {
      allSuccessful = false;
      console.log(`  Error: ${result.error}`);
    }
  }

  console.log('');
  if (allSuccessful) {
    console.log('🎉 All LLM connections successful!');
    console.log('Your multi-LLM compliance platform is ready to go!');
  } else {
    console.log('⚠️ Some LLM connections failed!');
    console.log('Please check your API keys and try again.');
  }
}

// Test Claude connection
async function testClaude() {
  console.log('Testing Claude 3.5 Sonnet connection...');
  
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{ role: 'user', content: TEST_MESSAGE }]
    });

    console.log('✅ Claude connection successful');
    console.log(`Response: "${response.content[0].text.trim()}"`);
    
    return { success: true };
  } catch (error) {
    console.log(`❌ Claude connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test GPT-4 connection
async function testGPT4() {
  console.log('Testing GPT-4 connection...');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: TEST_MESSAGE }],
      max_tokens: 50
    });

    console.log('✅ GPT-4 connection successful');
    console.log(`Response: "${response.choices[0].message.content.trim()}"`);
    
    return { success: true };
  } catch (error) {
    console.log(`❌ GPT-4 connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Gemini connection (UPDATED MODEL)
async function testGemini() {
  console.log('Testing Gemini connection...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(TEST_MESSAGE);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini connection successful');
    console.log(`Response: "${text.trim()}"`);
    
    return { success: true };
  } catch (error) {
    console.log(`❌ Gemini connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Llama connection (UPDATED MODEL)
async function testLlama() {
  console.log('Testing Llama connection...');
  
  try {
    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    });

    const response = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [{ role: 'user', content: TEST_MESSAGE }],
      max_tokens: 50
    });

    console.log('✅ Llama connection successful');
    console.log(`Response: "${response.choices[0].message.content.trim()}"`);
    
    return { success: true };
  } catch (error) {
    console.log(`❌ Llama connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run all tests
testAllConnections().catch(error => {
  console.error(`Error running tests: ${error.message}`);
  process.exit(1);
});
