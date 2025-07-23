// Simple Auth Test for FreightPowerAI
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAuth() {
  console.log('🔐 Testing Authentication Flow...\n');
  
  try {
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    const testUsername = `testuser_${timestamp}`;
    
    // Test registration
    console.log('1. Testing Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: testUsername,
      email: testEmail,
      password: 'testpass123',
      role: 'driver'
    });
    console.log('✅ Registration successful:', registerResponse.data);
    
    // Test login
    console.log('\n2. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'testpass123'
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    if (token) {
      console.log('✅ JWT Token received:', token.substring(0, 20) + '...');
      
      // Test protected route
      console.log('\n3. Testing Protected Route...');
      const protectedResponse = await axios.get(`${BASE_URL}/api/v1/route/status?trip_id=test_trip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route access successful:', protectedResponse.data);
      
      return token; // Return token for other tests
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
    return null;
  }
}

testAuth();
