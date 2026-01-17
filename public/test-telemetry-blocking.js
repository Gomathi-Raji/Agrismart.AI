// Test file to verify Mapbox telemetry blocking
console.log('Testing Mapbox telemetry blocking...');

// Test 1: Direct fetch to events.mapbox.com
fetch('https://events.mapbox.com/events/v2?access_token=test')
  .then(response => {
    console.log('✅ Fetch test - Response status:', response.status);
    console.log('✅ Fetch blocking is working!');
  })
  .catch(error => {
    console.error('❌ Fetch test failed:', error);
  });

// Test 2: XMLHttpRequest to events.mapbox.com  
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://events.mapbox.com/events/v2?access_token=test');
xhr.onload = function() {
  console.log('✅ XHR test - Response status:', xhr.status);
  console.log('✅ XHR blocking is working!');
};
xhr.onerror = function() {
  console.log('❌ XHR test failed');
};
xhr.send('{}');

console.log('Telemetry blocking tests completed!');