/**
 * Simple Database Seed Script
 * This script creates sample data for testing
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'translated_novels';

const sampleNovels = [
  {
    title: "The Beginning After The End",
    author: "TurtleMe", 
    status: "ongoing",
    total_chapters: 3,
    description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Beneath the glamorous exterior of a powerful king lurks the shell of man, devoid of purpose and will. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life.",
    tags: ["Fantasy", "Adventure", "Magic", "Reincarnation"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Solo Leveling", 
    author: "Chugong",
    status: "completed",
    total_chapters: 2,
    description: "10 years ago, after the Gate that connected the real world with the monster world opened, some people received the power to hunt monsters within the Gate. They are known as Hunters. My name is Sung Jin-Woo, an E-rank Hunter who has to risk his life in the lowliest of dungeons.",
    tags: ["Action", "Fantasy", "LitRPG", "Dungeon"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Omniscient Reader's Viewpoint",
    author: "sing Shong",
    status: "completed", 
    total_chapters: 2,
    description: "Dokja was an average office worker whose sole interest was reading his favorite web novel. But when the novel suddenly becomes reality, he is the only person who knows how the world will end.",
    tags: ["Fantasy", "Adventure", "Apocalypse", "System"],
    created_at: new Date(),
    updated_at: new Date()
  }
];

const sampleChapters = [
  {
    novel_index: 0,
    chapter_id: 1,
    title: "Prologue", 
    content: "I never believed in the whole light at the end of the tunnel folly where people, after having a near-death experience, would startle awake in a cold sweat exclaiming that they saw the light. But there I was, in this so-called tunnel facing a glaring light, when the last thing I remembered was sleeping in my room. Did I die? If so, how? The pain was excruciating. My entire body was being torn apart and stitched back together again. Just when I thought I could not bear it any longer, the pain stopped. The blinding light dimmed and I could finally see my surroundings. There were two giant faces peering down at me with the widest grins I had ever seen. I realized I had been reincarnated as a baby.",
    order: 1,
    word_count: 156,
    character_count: 780,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 0,
    chapter_id: 2,  
    title: "Chapter 1: New Life",
    content: "After accepting that I had been reincarnated into a baby, many questions still remained. I seemed to be in some sort of medieval fantasy world, judging by the clothes everyone wore and the general atmosphere. But what confirmed this was when I first saw someone use magic. It was about a month after I had been born when a kindly old man came to visit. While he was examining me, he placed his hand on my forehead and I felt a warm, tingling sensation. A soft, golden light emanated from his palm. Magic! Real magic! So I am in a world with magic, and apparently I have some sort of magical potential. My father was Reynolds Leywin, a former adventurer, and my mother was Alice. I would not repeat the mistakes of my previous life. This time, I would value the relationships I formed.",
    order: 2,
    word_count: 145,
    character_count: 765,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 0,
    chapter_id: 3,
    title: "Chapter 2: Growing Up",
    content: "As the months passed, I began to grow and develop both physically and mentally. My parents were loving and attentive, something I had not experienced in my previous life as King Grey. My father Reynolds would often tell me stories of his adventures, while my mother Alice would sing lullabies and teach me basic words. I could feel my mana core slowly forming and strengthening within me. Unlike in my previous world where strength was everything, here I was learning the value of family and genuine relationships. I promised myself that I would not make the same mistakes again. This second chance at life would be different.",
    order: 3,
    word_count: 125,
    character_count: 625,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 1,
    chapter_id: 101,
    title: "Chapter 1: The World's Weakest Hunter",
    content: "Status recovery potion, three hundred dollars. Mana recovery potion, five hundred dollars. This one is a bit expensive, but the antidote hanging in the display case costs three thousand dollars. Way too expensive. I cannot afford any of these. Even the cheapest item was too expensive for me. I left the item shop and headed toward the meeting point. Kim Sangshik, a D-rank Tank, called out to me. Even though he was one rank higher than me, he always treated me kindly. Soon, the other members started arriving. Our leader Hwang Dong-suk, a C-rank Fighter, explained our mission. We are entering a D-rank Gate discovered three days ago. As the weakest member of the team, my job was essentially to be a pack mule and try not to die.",
    order: 1,
    word_count: 156,
    character_count: 785,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 1,
    chapter_id: 102,
    title: "Chapter 2: The Dungeon", 
    content: "The inside of the dungeon was exactly as described, a mine. Wooden support beams lined the walls and ceiling, and the air was stale and musty. Our footsteps echoed through the narrow tunnels as we made our way deeper. Even though I was the weakest, I was still a Hunter. I had awakened five years ago, but unfortunately, I was classified as an E-rank, the lowest possible rank. Most E-rank Hunters quit after a few months, but I could not quit. My mother was in the hospital, and my younger sister was still in high school. So here I was, risking my life in dungeons for a few hundred dollars per raid. We encountered kobolds and eventually reached the boss room with a hobgoblin. After defeating it, I noticed something strange - another tunnel that was not supposed to be there.",
    order: 2,
    word_count: 165,
    character_count: 825,
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    console.log('Connected successfully to MongoDB');
    
    // Clear existing data
    await db.collection('novels').deleteMany({});
    await db.collection('chapters').deleteMany({});
    
    // Insert novels
    const novelResult = await db.collection('novels').insertMany(sampleNovels);
    console.log(`Inserted ${novelResult.insertedCount} novels`);
    
    // Get inserted novels
    const insertedNovels = await db.collection('novels').find({}).toArray();
    
    // Create chapters with novel ObjectIds
    const chaptersToInsert = sampleChapters.map(chapter => {
      const { novel_index, ...chapterData } = chapter;
      return {
        ...chapterData,
        novel_id: insertedNovels[novel_index]._id,
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    
    // Insert chapters
    const chapterResult = await db.collection('chapters').insertMany(chaptersToInsert);
    console.log(`Inserted ${chapterResult.insertedCount} chapters`);
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedDatabase();