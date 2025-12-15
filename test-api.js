// Quick test script to verify Gemini API
const API_KEY = 'AIzaSyAq-9HuOq8Ml10LOwTEg7qRJXBPvi1KoY8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const testPrompt = {
  contents: [{
    parts: [{
      text: "Explain how AI works in a few words"
    }]
  }]
};

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-goog-api-key': API_KEY,
  },
  body: JSON.stringify(testPrompt),
})
.then(response => {
  console.log('Status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  console.log('Success! Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});

