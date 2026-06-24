async function seed() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@food.com', password: 'admin123' })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful!');

    console.log('Seeding 70 products...');
    const initRes = await fetch('http://localhost:5000/api/products/init', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!initRes.ok) throw new Error(`Seeding failed: ${initRes.status}`);
    const initData = await initRes.json();
    console.log('Success! Items seeded:', initData.data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

seed();
