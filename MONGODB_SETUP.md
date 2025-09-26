# MongoDB Setup Instructions

## For Development

1. Create a `.env.local` file in the root directory
2. Add your MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   ```

## For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string
   - Environment: Production

## Getting Your MongoDB URI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Go to Database Access → Add New Database User
4. Go to Network Access → Add IP Address (use 0.0.0.0/0 for global access)
5. Go to Clusters → Connect → Connect your application
6. Copy the connection string and replace `<password>` with your database password

## Database Structure

Your MongoDB should have these collections:
- `novels` - Contains novel metadata
- `chapters` - Contains chapter content

See the seed scripts in `/scripts/` for examples of the expected data structure.

## Security Notes

- Never commit your actual MongoDB URI to git
- The `.env*` files are already in .gitignore
- Use environment variables for all sensitive credentials