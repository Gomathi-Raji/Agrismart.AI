// Quick test script to verify detection works
const detectionService = require('./src/services/simpleRealDetection');

console.log('🧪 Testing detection system...');

// Add a test callback
detectionService.onDetection((detections) => {
  console.log('🎯 TEST CALLBACK RECEIVED:', detections.length, 'detections');
  detections.forEach((det, i) => {
    console.log(`  ${i+1}. ${det.class}: ${Math.round(det.confidence * 100)}%`);
  });
});

// Set the correct camera URL
detectionService.setCameraUrl('http://100.107.58.254:8080');

// Start detection
detectionService.startDetection().then(result => {
  console.log('📡 Start result:', result);
  
  // Let it run for 10 seconds then stop
  setTimeout(() => {
    console.log('🛑 Stopping test...');
    detectionService.stopDetection();
    process.exit(0);
  }, 10000);
});