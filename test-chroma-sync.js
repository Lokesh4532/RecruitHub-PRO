// Test script to sync candidates to ChromaDB
// Run this with: node test-chroma-sync.js

async function syncCandidates() {
  try {
    console.log(' Starting ChromaDB sync...\n');
    
    const response = await fetch('http://localhost:3000/api/chroma/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your JWT token here if testing locally
        // 'Cookie': 'token=YOUR_JWT_TOKEN'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(' Sync failed:', data.error);
      console.error('Details:', data.details || 'No details available');
      return;
    }

    console.log(' Sync completed successfully!\n');
    console.log(' Results:');
    console.log(`   - Total candidates: ${data.totalCandidates}`);
    console.log(`   - Synced: ${data.synced}`);
    console.log(`   - Failed: ${data.failed}`);
    
    if (data.stats) {
      console.log('\n ChromaDB Stats:');
      console.log(`   - Collection: ${data.stats.collection}`);
      console.log(`   - Total documents: ${data.stats.count}`);
    }

  } catch (error) {
    console.error(' Error:', error.message);
  }
}

syncCandidates();
