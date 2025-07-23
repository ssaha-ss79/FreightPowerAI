// Comprehensive API Test Script for FreightPowerAI Services
// Tests all services according to the exact requirements

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
let TEST_TOKEN = null;

// Test configuration
const testConfig = {
  driver_id: 'test_driver_123',
  trip_id: 'test_trip_123',
  vehicle_id: 'test_vehicle_123',
  latitude: '28.6139',
  longitude: '77.2090', // Delhi coordinates
  dispatcher_id: 'test_dispatcher_123'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

function logTest(service, endpoint, status, details = '') {
  const result = status ? 'PASS' : 'FAIL';
  let logDetails = details;
  if (typeof details === 'object') {
    logDetails = JSON.stringify(details);
  }
  console.log(`[${result}] ${service} - ${endpoint}: ${logDetails}`);
  testResults.details.push({ service, endpoint, status, details: logDetails });
  if (status) testResults.passed++;
  else testResults.failed++;
}

async function authenticate() {
  try {
    console.log('🔐 Setting up authentication...');
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    const testUsername = `testuser_${timestamp}`;
    
    // Register test user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: testUsername,
      email: testEmail,
      password: 'testpass123',
      role: 'driver'
    });
    
    TEST_TOKEN = registerResponse.data.token;
    testConfig.driver_id = registerResponse.data.user.id;
    console.log('✅ Authentication setup complete\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAPI(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return {
      success: response.status === expectedStatus,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive FreightPowerAI Services Test...\n');
  
  // Setup authentication first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }
  
  // 1. Route Navigation Service Tests
  console.log('📍 Testing Route Navigation Service...');
  
  // First create a test trip to avoid "trip not found" errors
  const createTripResult = await testAPI('post', '/api/v1/trips', {
    driver_id: testConfig.driver_id,
    load_id: 'test_load_123',
    status: 'in_progress',
    start_time: new Date().toISOString(),
    pickup_location: testConfig.latitude + ',' + testConfig.longitude,
    delivery_location: '26.9124,75.7873'
  }, 201);
  
  if (createTripResult.success) {
    testConfig.trip_id = createTripResult.data.trip?.id || testConfig.trip_id;
    console.log('✅ Test trip created:', testConfig.trip_id);
  }
  
  // POST /route/plan
  let result = await testAPI('post', '/api/v1/route/plan', {
    origin: { latitude: testConfig.latitude, longitude: testConfig.longitude },
    destination: { latitude: '26.9124', longitude: '75.7873' }, // Jaipur
    trip_id: testConfig.trip_id
  });
  logTest('Route Navigation', 'POST /route/plan', result.success, result.data?.route || result.error);
  
  // GET /route/status
  result = await testAPI('get', `/api/v1/route/status?trip_id=${testConfig.trip_id}`);
  logTest('Route Navigation', 'GET /route/status', result.success, result.data?.route_status || result.error);
  
  // POST /route/reroute
  result = await testAPI('post', '/api/v1/route/reroute', {
    trip_id: testConfig.trip_id,
    reason: 'traffic_congestion',
    avoid_tolls: true
  });
  logTest('Route Navigation', 'POST /route/reroute', result.success, result.data?.new_route || result.error);
  
  // 2. Fuel Monitoring Service Tests
  console.log('\n⛽ Testing Fuel Monitoring Service...');
  
  // GET /fuel/status
  result = await testAPI('get', `/api/v1/fuel/status?vehicle_id=${testConfig.vehicle_id}`);
  logTest('Fuel Monitoring', 'GET /fuel/status', result.success, result.data?.fuel_status || result.error);
  
  // GET /fuel/nearest-station
  result = await testAPI('get', `/api/v1/fuel/nearest-station?latitude=${testConfig.latitude}&longitude=${testConfig.longitude}&radius_km=50`);
  logTest('Fuel Monitoring', 'GET /fuel/nearest-station', result.success, `Found ${result.data?.fuel_stations?.length || 0} stations`);
  
  // 3. Weather & Traffic Service Tests
  console.log('\n🌦️ Testing Weather & Traffic Service...');
  
  // GET /alerts/weather
  result = await testAPI('get', `/api/v1/alerts/weather?latitude=${testConfig.latitude}&longitude=${testConfig.longitude}`);
  logTest('Weather & Traffic', 'GET /alerts/weather', result.success, `Found ${result.data?.weather_alerts?.length || 0} weather alerts`);
  
  // GET /alerts/traffic
  result = await testAPI('get', `/api/v1/alerts/traffic?latitude=${testConfig.latitude}&longitude=${testConfig.longitude}`);
  logTest('Weather & Traffic', 'GET /alerts/traffic', result.success, `Found ${result.data?.traffic_alerts?.length || 0} traffic alerts`);
  
  // 4. Check-in/Check-out Service Tests
  console.log('\n📋 Testing Check-in/Check-out Service...');
  
  // POST /checkin
  result = await testAPI('post', '/api/v1/checkin', {
    driver_id: testConfig.driver_id,
    trip_id: testConfig.trip_id,
    location: { latitude: testConfig.latitude, longitude: testConfig.longitude },
    timestamp: new Date().toISOString(),
    yard_details: { yard_name: 'Main Depot', gate_number: 'A1' }
  }, 201);
  logTest('Check-in/Check-out', 'POST /checkin', result.success, result.data?.message || result.error);
  
  // POST /checkout
  result = await testAPI('post', '/api/v1/checkin/checkout', {
    driver_id: testConfig.driver_id,
    trip_id: testConfig.trip_id,
    location: { latitude: testConfig.latitude, longitude: testConfig.longitude },
    timestamp: new Date().toISOString(),
    checkout_details: { yard_name: 'Main Depot', gate_number: 'A1', duration_minutes: 120 }
  }, 201);
  logTest('Check-in/Check-out', 'POST /checkout', result.success, result.data?.message || result.error);
  
  // POST /dropoff
  result = await testAPI('post', '/api/v1/checkin/dropoff', {
    driver_id: testConfig.driver_id,
    trip_id: testConfig.trip_id,
    location: { latitude: '26.9124', longitude: '75.7873' },
    timestamp: new Date().toISOString(),
    load_details: { 
      delivery_address: '123 Business Park, Jaipur',
      recipient_name: 'John Doe',
      signature_received: true
    }
  }, 201);
  logTest('Check-in/Check-out', 'POST /dropoff', result.success, result.data?.message || result.error);
  
  // 5. Notification Processing Service Tests
  console.log('\n🔔 Testing Notification Processing Service...');
  
  // POST /notifications/ingest
  result = await testAPI('post', '/api/v1/notifications/ingest', {
    driver_id: testConfig.driver_id,
    message_content: 'New load assignment available for your route',
    source_system: 'MS Teams',
    status: 'unread',
    received_at: new Date().toISOString()
  }, 201);
  logTest('Notification Processing', 'POST /notifications/ingest', result.success, result.data?.notification?.id || result.error);
  
  // GET /notifications/driver/:driver_id
  result = await testAPI('get', `/api/v1/notifications/driver/${testConfig.driver_id}`);
  logTest('Notification Processing', 'GET /notifications/driver/:driver_id', result.success, `Found ${result.data?.length || 0} notifications`);
  
  // 6. Document Management Service Tests
  console.log('\n📄 Testing Document Management Service...');
  
  // POST /documents/upload
  result = await testAPI('post', '/api/v1/documents/upload', {
    driver_id: testConfig.driver_id,
    trip_id: testConfig.trip_id,
    type: 'delivery_receipt',
    filename: 'receipt_001.pdf',
    storage_url: 'https://storage.example.com/receipts/receipt_001.pdf',
    tags: 'delivery,receipt,completed',
    uploaded_at: new Date().toISOString()
  }, 201);
  logTest('Document Management', 'POST /documents/upload', result.success, result.data?.document?.id || result.error);
  
  // GET /documents/list
  result = await testAPI('get', `/api/v1/documents/list?driver_id=${testConfig.driver_id}`);
  logTest('Document Management', 'GET /documents/list', result.success, `Found ${result.data?.documents?.length || 0} documents`);
  
  // 7. Dispatch Communication Service Tests
  console.log('\n📞 Testing Dispatch Communication Service...');
  
  // POST /dispatch/send-voice-message
  result = await testAPI('post', '/api/v1/dispatch/send-voice-message', {
    sender_id: testConfig.dispatcher_id,
    receiver_id: testConfig.driver_id,
    message_type: 'voice',
    content_url: 'https://storage.example.com/voice/msg_001.mp3',
    text_content: 'Please confirm your arrival at destination',
    timestamp: new Date().toISOString(),
    status: 'sent'
  }, 201);
  logTest('Dispatch Communication', 'POST /dispatch/send-voice-message', result.success, result.data?.message?.id || result.error);
  
  // GET /dispatch/messages
  result = await testAPI('get', `/api/v1/dispatch/messages?driver_id=${testConfig.driver_id}`);
  logTest('Dispatch Communication', 'GET /dispatch/messages', result.success, `Found ${result.data?.messages?.length || 0} messages`);
  
  // 8. Emergency Assistance Service Tests
  console.log('\n🚨 Testing Emergency Assistance Service...');
  
  // POST /emergency/trigger
  result = await testAPI('post', '/api/v1/emergency/trigger', {
    driver_id: testConfig.driver_id,
    location: { latitude: testConfig.latitude, longitude: testConfig.longitude },
    vehicle_data: {
      fuel_level: 45,
      engine_status: 'running',
      tire_pressure: 'normal',
      brake_status: 'functional'
    },
    status: 'active',
    emergency_type: 'breakdown',
    notes: 'Engine overheating, pulled over safely'
  }, 201);
  const emergencyId = result.data?.log_id;
  logTest('Emergency Assistance', 'POST /emergency/trigger', result.success, `Emergency ID: ${emergencyId || 'Failed'}`);
  
  // GET /emergency/:emergency_id/status (if emergency was created)
  if (emergencyId) {
    result = await testAPI('get', `/api/v1/emergency/${emergencyId}/status`);
    logTest('Emergency Assistance', 'GET /emergency/:id/status', result.success, result.data?.emergency_status?.current_status || result.error);
  }
  
  // Test Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n🔍 Failed Tests:');
    testResults.details
      .filter(test => !test.status)
      .forEach(test => console.log(`   - ${test.service} ${test.endpoint}: ${test.details}`));
  }
  
  console.log('\n🎉 Comprehensive Service Test Completed!');
}

// Run the tests
runTests().catch(console.error);
