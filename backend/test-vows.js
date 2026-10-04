const http = require('http');

const postRequest = (path, data, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, body: parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ status: res.statusCode, error: responseBody });
        }
      });
    });

    req.on('error', (err) => { reject(err); });
    req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('--- VND SPEECH & VOWS GENERATION TEST ---');
  
  try {
    // 1. Register User
    console.log('\n1. Registering Couple...');
    const registerResponse = await postRequest('/api/auth/register', {
      name: 'Elena Gilbert & Damon Salvatore',
      email: `elena.damon.${Date.now()}@mysticfalls.com`,
      password: 'Password123',
      role: 'couple',
      partnerName: 'Damon Salvatore',
      weddingDate: '2027-08-18',
      location: 'Mystic Falls, VA',
      theme: 'Classic Vampire Elegance'
    });
    console.log('✓ Registered successfully! Token length:', registerResponse.token.length);
    const token = registerResponse.token;
    
    // 2. Query Vow speech generator
    console.log('\n2. Sending Vow generation request (Bride, Elena, Tone: Romantic)...');
    const speechResponse = await postRequest('/api/ai/generate-speech', {
      role: 'Bride',
      partner_name: 'Damon',
      traits: ['loving', 'dashing', 'mysterious'],
      memories: 'we danced at the Miss Mystic Falls pageant',
      tone: 'Romantic'
    }, token);

    console.log('✓ AI Vows generated successfully:');
    console.log('====================================');
    console.log(speechResponse.text);
    console.log('====================================');
    console.log('  Credits used:', speechResponse.creditsUsed, '- AI Credits remaining:', speechResponse.aiCredits);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTests();
