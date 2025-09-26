import { MongoClient, Db } from 'mongodb';

// Don't throw error at module level - let individual functions handle it
const uri = process.env.MONGODB_URI;
const options = {};

// Helper function to check environment
export function checkMongoConnection(): string | null {
  if (!uri) {
    return `
    Please define the MONGODB_URI environment variable.
    
    For local development: Add it to .env or .env.local
    For Vercel: Add it in Settings → Environment Variables
    
    Current NODE_ENV: ${process.env.NODE_ENV}
  `;
  }
  return null;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

// Only create client if URI is available
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongoClient = globalThis as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongoClient._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongoClient._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongoClient._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Helper function to get database
export async function getDatabase(): Promise<Db> {
  const connectionError = checkMongoConnection();
  if (connectionError) {
    throw new Error(connectionError);
  }
  
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized');
  }
  
  const client = await clientPromise;
  return client.db('translated_novels');
}