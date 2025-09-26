# 📚 LiveNovel - Full-Stack Webnovel Reading Platform

A modern, responsive web novel reading platform built with Next.js 14, TypeScript, and MongoDB. Features a clean reading interface, bookmark system, and seamless chapter navigation.

![LiveNovel Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=LiveNovel+Reading+Platform)

## ✨ Features

- 📖 **Clean Reading Interface** - Distraction-free reading experience with customizable font sizes
- 🔖 **Bookmark System** - Save reading progress and resume where you left off
- 🏃‍♂️ **Fast Navigation** - Seamless chapter-to-chapter navigation with keyboard shortcuts
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop viewing
- 🌙 **Dark Mode Support** - Eye-friendly reading in any lighting condition
- 🔍 **Novel Discovery** - Browse novels with status indicators and progress tracking
- ⚡ **High Performance** - Built with Next.js 14 App Router for optimal speed

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB Atlas
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or any hosting platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/livenovel.git
   cd livenovel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
LiveNovel/
├── app/
│   ├── page.tsx                    # Home page with novel grid
│   ├── novel/[id]/page.tsx        # Novel details and chapter list
│   ├── chapter/[id]/page.tsx      # Chapter reading interface
│   └── api/                       # API routes
│       ├── novels/                # Get all novels
│       ├── novel/[id]/            # Novel-specific endpoints
│       └── chapter/[id]/          # Chapter content endpoint
├── components/
│   ├── NovelCard.tsx              # Novel display cards
│   ├── ChapterList.tsx            # Chapter navigation
│   ├── BookmarkButton.tsx         # Bookmark functionality
│   └── LoadingSpinner.tsx         # Loading states
├── lib/
│   ├── mongodb.ts                 # Database connection
│   └── bookmarks.ts               # Bookmark management
├── types/
│   └── index.ts                   # TypeScript interfaces
└── scripts/
    └── seed-database.js           # Database seeding script
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/novels` | GET | Get all novels |
| `/api/novel/[id]` | GET | Get novel details |
| `/api/novel/[id]/chapters` | GET | Get novel chapters |
| `/api/chapter/[id]` | GET | Get chapter content |

## 📚 Data Schema

### Novel Schema
```typescript
interface Novel {
  _id: string | ObjectId;
  novel_id: string;
  title: string;
  author: string;
  description: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  total_chapters: number;
  total_words: number;
  language: string;
  created_at: Date;
  updated_at: Date;
}
```

### Chapter Schema
```typescript
interface Chapter {
  _id: string | ObjectId;
  chapter_id: string;
  novel_id: string;
  title: string;
  content: string;
  order: number;
  word_count: number;
  created_at: Date;
  updated_at: Date;
}
```

## 🎨 Key Features

### Reading Experience
- **Font Size Control**: Adjustable text size (14px - 24px)
- **Keyboard Navigation**: Arrow keys for chapter navigation
- **Reading Progress**: Visual progress indicators
- **Auto-save Bookmarks**: Automatic progress saving

### Novel Management
- **Status Tracking**: Ongoing, completed, and hiatus indicators
- **Statistics**: Word counts, chapter counts, and reading progress
- **Custom IDs**: Support for both MongoDB ObjectIds and custom string IDs

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your Vercel account to GitHub

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   Add your `MONGODB_URI` in Vercel dashboard

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `out`
   - Add environment variables

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you found this project helpful, please give it a ⭐️ on GitHub!

For questions or support, please open an issue or contact [your-email@domain.com](mailto:your-email@domain.com).

---

**Built with ❤️ using Next.js and TypeScript**