/**
 * Database Seed Script
 * Run with: node scripts/seed.js
 * 
 * This script populates the MongoDB database with sample novels and chapters
 * for testing the webnovel reading site.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  console.error('Please define MONGODB_URI in your .env.local file');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = 'translated_novels';

// Sample data
const sampleNovels = [
  {
    title: "The Beginning After The End",
    author: "TurtleMe",
    status: "ongoing",
    total_chapters: 450,
    description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Beneath the glamorous exterior of a powerful king lurks the shell of man, devoid of purpose and will. Reincarnated into a new world filled with magic and monsters, the king has a second chance to relive his life. Correcting the mistakes of his past will not be his only challenge, however. Underneath the peace and prosperity of the new world is an undercurrent threatening to destroy everything he has worked for, questioning his role and reason for being born again.",
    tags: ["Fantasy", "Adventure", "Magic", "Reincarnation"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Solo Leveling",
    author: "Chugong",
    status: "completed",
    total_chapters: 270,
    description: "10 years ago, after 'the Gate' that connected the real world with the monster world opened, some of the ordinary, everyday people received the power to hunt monsters within the Gate. They are known as 'Hunters'. However, not all Hunters are powerful. My name is Sung Jin-Woo, an E-rank Hunter. I'm someone who has to risk his life in the lowliest of dungeons, the 'World's Weakest'. Having no skills whatsoever to display, I barely earned the required money by fighting in low-leveled dungeons… at least until I found a hidden dungeon with the hardest difficulty within the D-rank dungeons! In the end, as I was accepting death, I suddenly received a strange power, a quest log that only I could see, a secret to leveling up that only I know about! If I trained in accordance with my quests and hunted monsters, my level would rise. Changing from the weakest Hunter to the strongest S-rank Hunter!",
    tags: ["Action", "Fantasy", "LitRPG", "Dungeon"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Omniscient Reader's Viewpoint",
    author: "sing Shong",
    status: "completed",
    total_chapters: 551,
    description: "Dokja was an average office worker whose sole interest was reading his favorite web novel 'Three Ways to Survive the Apocalypse.' But when the novel suddenly becomes reality, he is the only person who knows how the world will end. Armed with this realization, Dokja uses his understanding to change the course of the story, and the world, as he knows it.",
    tags: ["Fantasy", "Adventure", "Apocalypse", "System"],
    created_at: new Date(),
    updated_at: new Date()
  }
];

const sampleChapters = [
  // Chapters for "The Beginning After The End" (first novel)
  {
    novel_index: 0,
    chapter_id: 1,
    title: "Prologue",
    content: `I never believed in the whole 'light at the end of the tunnel' folly where people, after having a near-death experience, would startle awake in a cold sweat exclaiming, 'I saw the light!'

But there I was, in this so-called 'tunnel' facing a glaring light, when the last thing I remembered was sleeping in my room—the royal bed chamber.

Did I die? If so, how?

Even better question: if I'm supposedly dead, then why does it hurt so much?

The pain was excruciating. My entire body, no, my entire being was being torn apart and stitched back together again. The light at the end of the tunnel was getting brighter and brighter until it hurt to keep my eyes open.

Hell, even closing my eyes didn't help to diminish this piercing light.

It was unbearable, but somehow familiar, as if I had experienced this before. But when? I can't remember when—

Dammit, when will this pain end?

Just when I thought I couldn't bear it any longer, the pain stopped. The blinding light dimmed and I could finally see my surroundings, or rather, who was around me.

'WAAAAAAHHHHH!'

'Huh?'

I could hear crying. Very loud crying, mind you. Looking around, trying to find the source, my eyes finally turned downward and I realized—'Holy shit, that crying is coming from me!'

I immediately stopped crying and looked around. There were two giant faces peering down at me with the widest grins I had ever seen.

'What's with these giants?'

'Congratulations! It's a healthy boy!' squealed a woman.

'A boy? What the hell was she talking about?'

Immediately, I noticed something was wrong. No, a lot of things were wrong.

Why was my voice so high?

Why couldn't I speak properly?

Why couldn't I move my body the way I wanted to?

Looking down at myself, I could only see a small, rounded body with tiny arms and tiny legs.

'Holy crap! I'm a baby!'`,
    order: 1,
    word_count: 324,
    character_count: 1456,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 0,
    chapter_id: 2,
    title: "Chapter 1: New Life",
    content: `After accepting that I had been reincarnated into a baby, many questions still remained.

I seemed to be in some sort of medieval fantasy world, judging by the clothes everyone wore and the general atmosphere. But what confirmed this was when I first saw someone use magic.

It was about a month after I had been born when a kindly old man came to visit. He had a long white beard and wore simple brown robes. My parents seemed to treat him with great respect.

While he was examining me, he placed his hand on my forehead and I felt a warm, tingling sensation. A soft, golden light emanated from his palm.

Magic! Real magic!

    content: `'The child is healthy and has good potential,' the old man said to my parents. 'His mana core is already beginning to form, which is unusual for one so young.'`

My parents' faces lit up with joy at this news.

So I'm in a world with magic, and apparently I have some sort of magical potential. This is... interesting.

My father, whose name I learned was Reynolds Leywin, was a former adventurer who had settled down when he met my mother, Alice. From what I could gather from their conversations, they had moved to this remote town called Ashber to start a family.

My father was a competent warrior who wielded both sword and magic, while my mother was skilled in healing magic and archery. They seemed like good people, much better parents than I had in my previous life.

In my previous life, I was Arthur Leywin—wait, that's not right. I was King Grey, but that name seems so foreign now. Arthur... that's who I am now. Arthur Leywin.

As the days passed, I began to adjust to this new life. Being a baby was frustrating—I couldn't move around freely, I couldn't speak properly, and I was completely dependent on others. But I was determined to make the most of this second chance.

I would not repeat the mistakes of my previous life. This time, I would value the relationships I formed and not let power isolate me from those I cared about.`,
    order: 2,
    word_count: 356,
    character_count: 1678,
    created_at: new Date(),
    updated_at: new Date()
  },
  // Chapters for "Solo Leveling" (second novel)
  {
    novel_index: 1,
    chapter_id: 101,
    title: "Chapter 1: The World's Weakest Hunter",
    content: `"Status recovery potion, $300. Mana recovery potion, $500. This one's a bit expensive, but..."

I looked at the antidote hanging in the display case.

"Antidote, $3000."

Way too expensive.

I let out a sigh.

'I can't afford any of these.'

Even the cheapest item was too expensive for me. The $300 status recovery potion was equivalent to three months of my rent.

'I'll just have to be extra careful today.'

I left the item shop and headed toward the meeting point. A group of people was already gathered there, and most of them were familiar faces.

"Oh, Jin-Woo! Over here!"

The one calling me was Kim Sangshik, a D-rank Tank. Even though he was one rank higher than me, he always treated me kindly.

"Good morning, Mr. Kim."

"Morning! You're early today."

"Yes, I wanted to make sure I wasn't late."

I checked my watch. There were still ten minutes before the scheduled meeting time.

Soon, the other members started arriving one by one.

Song Chi-Yul, a D-rank Healer.
Park Hee-Jin, a D-rank Mage.
Yoo Jinho, a D-rank Fighter (he was the son of a major guild's director, but his skills were... questionable).

And finally, the leader of our team arrived.

"Sorry I'm late!" 

Hwang Dong-suk, a C-rank Fighter, jogged up to our group. Despite being the lowest-ranked among the C-rank Hunters, he had enough experience to lead our ragtag team of D and E-rank Hunters.

"Alright, everyone's here. Let's go over the plan one more time."

We huddled together as Dong-suk explained our mission.

"We're entering a D-rank Gate that was discovered three days ago. Intel suggests it's a mine-type dungeon with kobolds and maybe some goblins. Standard sweep and clear."

He looked directly at me.

"Jin-Woo, you'll be handling the rear guard as usual. Just focus on staying alive and picking up the magic stones."

I nodded. As the weakest member of the team, my job was essentially to be a pack mule and try not to die. It wasn't glamorous, but it paid the bills... barely.

We approached the Gate, a swirling blue vortex about three meters in diameter. Even standing near it made my skin crawl. Every instinct in my body screamed at me to run away.

But I couldn't. I needed the money.`,
    order: 1,
    word_count: 423,
    character_count: 1892,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    novel_index: 1,
    chapter_id: 102,
    title: "Chapter 2: The Dungeon",
    content: `The inside of the dungeon was exactly as described—a mine.

Wooden support beams lined the walls and ceiling, and the air was stale and musty. Our footsteps echoed through the narrow tunnels as we made our way deeper.

"Stay close together," Dong-suk whispered. "Kobolds hunt in packs."

I followed behind the group, my heart pounding. Even though I was the weakest, I was still a Hunter. I had awakened five years ago, but unfortunately, I was classified as an E-rank—the lowest possible rank.

Most E-rank Hunters quit after a few months. The pay was terrible, the work was dangerous, and there was no possibility of ranking up. But I couldn't quit.

My mother was in the hospital, and my younger sister was still in high school. The insurance money from my father's death had long since run out, and my part-time jobs weren't enough to cover the medical bills.

So here I was, risking my life in dungeons for a few hundred dollars per raid.

"Contact ahead," Park Hee-Jin whispered.

Three kobolds came into view, their green skin glistening in the dim light of our torches. They were about the size of children but with the heads of dogs and vicious claws.

"I'll tank them," Kim Sangshik said, raising his shield. "Hee-Jin, hit them with magic missiles. Chi-Yul, be ready to heal. Jinho, try to flank them."

And me? I was to stay back and watch.

The battle was over quickly. Sangshik blocked their attacks while Hee-Jin blasted them with magic. Jinho managed to land a few hits, and even Chi-Yul contributed with a light spell that blinded one of the kobolds.

When the dust settled, three kobold corpses lay on the ground.

"Good work, everyone," Dong-suk said. "Jin-Woo, collect the magic stones."

I approached the corpses and began extracting the magic stones from their bodies. It wasn't pleasant work, but someone had to do it.

As we continued deeper into the dungeon, we encountered more kobolds. The battles followed the same pattern—the others fought while I stayed back and collected the loot afterward.

It was humiliating, but it was my reality.

After about two hours, we reached what appeared to be the boss room. The tunnel opened up into a large cavern, and at the far end sat a hobgoblin—a larger, more intelligent version of a regular goblin.

"This should be the boss," Dong-suk said. "Same strategy as before, but be extra careful. Hobgoblins are cunning."

The battle was harder than the previous encounters. The hobgoblin was fast and strong, and it seemed to anticipate our attacks. But eventually, we managed to bring it down.

"Is everyone okay?" Chi-Yul asked, casting healing spells on Sangshik, who had taken a few hits.

"Yeah, we're good," Dong-suk replied. "Jin-Woo, you know the drill."

As I approached the hobgoblin's corpse, I noticed something strange. Behind the creature, there was another tunnel—one that wasn't supposed to be there according to our intel.

"Hey," I called out. "There's another passage here."`,
    order: 2,
    word_count: 534,
    character_count: 2456,
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
    console.log('Clearing existing data...');
    await db.collection('novels').deleteMany({});
    await db.collection('chapters').deleteMany({});
    
    // Insert novels
    console.log('Inserting sample novels...');
    const novelResult = await db.collection('novels').insertMany(sampleNovels);
    console.log(`Inserted ${novelResult.insertedCount} novels`);
    
    // Get inserted novel IDs
    const insertedNovels = await db.collection('novels').find({}).toArray();
    
    // Update chapters with actual novel ObjectIds
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
    console.log('Inserting sample chapters...');
    const chapterResult = await db.collection('chapters').insertMany(chaptersToInsert);
    console.log(`Inserted ${chapterResult.insertedCount} chapters`);
    
    console.log('✅ Database seeded successfully!');
    console.log('\nSample data:');
    console.log(`- ${sampleNovels.length} novels`);
    console.log(`- ${sampleChapters.length} chapters`);
    console.log('\nYou can now start the development server and test the application.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the seed function
seedDatabase();