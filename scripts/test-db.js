#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Run this locally to verify your connection string works
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 Create .env.local file with your MongoDB connection string');
    process.exit(1);
  }
  
  console.log('🔄 Testing MongoDB connection...');
  console.log('🔗 URI (masked):', uri.replace(/:[^:]*@/, ':***@'));
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
    // Test novels collection
    const novelsCount = await db.collection('novels').countDocuments();
    console.log('📚 Novels in database:', novelsCount);
    
    if (novelsCount > 0) {
      const sampleNovel = await db.collection('novels').findOne();
      console.log('📖 Sample novel ID:', sampleNovel?._id || 'None');
      console.log('📖 Sample novel title:', sampleNovel?.title || 'None');
    }
    
    console.log('🎉 Connection test passed! Your MongoDB setup is working.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('🔑 Authentication issue - check username/password');
    } else if (error.message.includes('connection refused')) {
      console.log('🌐 Network issue - check IP whitelist in MongoDB Atlas');
    } else if (error.message.includes('timeout')) {
      console.log('⏰ Timeout - check network access settings');
    }
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();