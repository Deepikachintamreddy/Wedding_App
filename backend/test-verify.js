// Automated Backend Verification Test
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

const getRequest = (path, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

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
    req.end();
  });
};

const runTests = async () => {
  console.log('--- ELYSIAN BACKEND AUTOMATED INTEGRATION TESTS ---');
  
  try {
    // 1. Register User
    console.log('\n1. Registering Couple...');
    const registerResponse = await postRequest('/api/auth/register', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      role: 'couple',
      partnerName: 'Jane Smith',
      weddingDate: '2027-09-20',
      location: 'Santa Barbara, CA',
      theme: 'Modern Minimalist'
    });
    console.log('✓ Registered successfully! Token length:', registerResponse.token.length);
    const token = registerResponse.token;
    
    // 2. Fetch profile info
    console.log('\n2. Fetching current user profile...');
    const me = await getRequest('/api/auth/me', token);
    console.log('✓ Profile retrieved:', me.name, `(${me.role})`, '-', me.email);
    console.log('  Wedding Info:', me.weddingDate, '@', me.location);
    console.log('  AI Credits remaining:', me.aiCredits);
    
    // 3. Get initial tasks
    console.log('\n3. Fetching auto-generated tasks...');
    const tasks = await getRequest('/api/tasks', token);
    console.log(`✓ Fetched ${tasks.length} tasks successfully.`);
    console.log('  Sample Task 1:', tasks[0].title, `(Completed: ${tasks[0].completed})`);
    
    // 4. Create new task
    console.log('\n4. Creating custom task: "Design centerpieces"...');
    const newTask = await postRequest('/api/tasks', {
      title: 'Design centerpieces',
      category: 'Florals',
      period: '6 Months',
      dueDate: '2027-03-20',
      notes: 'Must match theme: Modern Minimalist',
      assignedTo: 'Bride'
    }, token);
    console.log('✓ Task created:', newTask.id, '-', newTask.title, `(${newTask.category})`);
    
    // 5. Query AI chatbot regarding budget
    console.log('\n5. Sending message to AI Concierge about budget...');
    const aiResponse = await postRequest('/api/ai/chat', {
      message: 'Can you help me divide my budget?'
    }, token);
    console.log('✓ AI Response received:');
    console.log('====================================');
    console.log(aiResponse.text.substring(0, 300) + '...\n[truncated]');
    console.log('====================================');
    console.log('  Credits used:', aiResponse.creditsUsed, '- AI Credits remaining:', aiResponse.aiCredits);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTests();
