/**
 * Test Oracle Database Connection
 * Run with: node test-connection.js
 */

import { testConnection } from './config/db.js';

async function test() {
  console.log('Testing Oracle database connection...\n');
  
  try {
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n✅ SUCCESS! Database connection is working.');
      console.log('You can now start the server with: npm start');
    } else {
      console.log('\n❌ FAILED! Could not connect to database.');
      console.log('Please check your .env file settings.');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify Oracle Database is running');
    console.log('2. Check credentials in .env file');
    console.log('3. Ensure connection string format is correct');
  }
  
  process.exit(0);
}

test();
