const axios = require('axios');

async function testHealth() {
  try {
    const res = await axios.get('http://localhost:4000/health');
    console.log('Health:', res.data);
  } catch (err) {
    console.error('Health check failed:', err.response?.data || err.message);
  }
}

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4000/auth/login', {
      email: 'test@example.com', // Change to a real user in your DB
      password: 'password123'    // Change to a real password
    });
    console.log('Login:', res.data);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

(async () => {
  await testHealth();
  await testLogin();
})();
