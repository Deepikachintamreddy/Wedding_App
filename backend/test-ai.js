async function testQuery(token, query) {
  const chatRes = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message: query })
  });
  
  const chatData = await chatRes.json();
  console.log(`\n========================================`);
  console.log(`Query: "${query}"`);
  console.log(`Response Status: ${chatRes.status}`);
  console.log(`Response Text:`);
  console.log(chatData.text);
  console.log(`========================================`);
}

async function testRecommendations(token) {
  const recRes = await fetch('http://localhost:5000/api/recommendations/vendors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const recData = await recRes.json();
  console.log(`\n========================================`);
  console.log(`TEST: Vendor Recommendations`);
  console.log(`Status: ${recRes.status}`);
  console.log(`Top 3 Recommendations:`);
  console.log(JSON.stringify(recData.recommendations ? recData.recommendations.slice(0, 3) : recData, null, 2));
  console.log(`========================================`);
}

async function testBudgetOptimization(token) {
  const optRes = await fetch('http://localhost:5000/api/budget/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      total_budget: 85000,
      priorities: {
        'Photography & Videography': 5,
        'Venue & Catering': 4,
        'Planner/Coordinator': 5
      },
      save_to_db: false
    })
  });

  const optData = await optRes.json();
  console.log(`\n========================================`);
  console.log(`TEST: Budget Optimization Calculator`);
  console.log(`Status: ${optRes.status}`);
  console.log(`Optimization Output:`);
  console.log(JSON.stringify(optData, null, 2));
  console.log(`========================================`);
}

async function runTests() {
  try {
    const email = `test_${Date.now()}@example.com`;
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Damon Salvatore',
        partnerName: 'Elena',
        email: email,
        password: 'password123',
        role: 'couple'
      })
    });
    
    let token = '';
    if (regRes.ok) {
      const regData = await regRes.json();
      token = regData.token;
      console.log(`Registered new test user: ${email}`);
    } else {
      console.error('Registration failed, attempting login...');
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: 'password123' })
      });
      const loginData = await loginRes.json();
      token = loginData.token;
    }

    // Run test queries
    await testQuery(token, 'hi');
    await testQuery(token, 'How are yoi?');

    // Run Vendor Recommendation Engine (Python matching)
    await testRecommendations(token);

    // Run Budget Optimization Calculator (Python optimization math)
    await testBudgetOptimization(token);

  } catch (err) {
    console.error('Error during test:', err);
  }
}

runTests();
