// Test script for logged-in generation
const fetch = require('node-fetch');

// Replace these with your actual test credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

async function runTest() {
  console.log('Starting logged-in generation test...');
  
  // Step 1: Sign in to get session
  console.log(`Signing in as ${TEST_EMAIL}...`);
  const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });
  
  const authData = await signInResponse.json();
  
  if (!authData.access_token) {
    console.error('Authentication error:', authData.error_description || authData.error || 'Unknown error');
    return;
  }
  
  console.log('Successfully signed in!');
  const accessToken = authData.access_token;
  
  // Step 2: Make first API call to generate analogies
  console.log('Making first API call to generate analogies...');
  const firstResponse = await fetch('http://localhost:3000/api/generate-analogies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      concept: 'quantum computing',
      audience: 'high school students'
    })
  });
  
  const firstData = await firstResponse.json();
  console.log('First API call response:');
  console.log('Usage:', firstData.usage);
  console.log('Analogies count:', firstData.analogies?.length || 0);
  
  // Step 3: Make second API call to verify usage increment
  console.log('\nMaking second API call to generate analogies...');
  const secondResponse = await fetch('http://localhost:3000/api/generate-analogies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      concept: 'blockchain',
      audience: 'business executives'
    })
  });
  
  const secondData = await secondResponse.json();
  console.log('Second API call response:');
  console.log('Usage:', secondData.usage);
  console.log('Analogies count:', secondData.analogies?.length || 0);
  
  // Step 4: Verify usage increment
  if (secondData.usage && firstData.usage) {
    if (secondData.usage.used > firstData.usage.used) {
      console.log('\n✅ SUCCESS: Usage count incremented correctly!');
      console.log(`First call used: ${firstData.usage.used}, Second call used: ${secondData.usage.used}`);
    } else {
      console.log('\n❌ FAILURE: Usage count did not increment correctly!');
      console.log(`First call used: ${firstData.usage.used}, Second call used: ${secondData.usage.used}`);
    }
  } else {
    console.log('\n❌ FAILURE: Could not verify usage count!');
  }
}

runTest().catch(console.error);