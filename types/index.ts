import { ObjectId } from 'mongodb';

// Novel interface
export interface Novel {
  _id?: ObjectId | string; // Allow both ObjectId and string for flexibility
  novel_id?: string; // Custom novel ID field
  title: string;
  author: string;
  status: 'ongoing' | 'completed' | 'dropped' | 'hiatus';
  total_chapters: number;
  description: string;
  cover_image?: string;
  tags?: string[];
  total_words?: number;
  language?: string;
  source_language?: string;
  statistics?: {
    avg_words_per_chapter?: number;
    total_characters?: number;
  };
  created_at?: Date;
  updated_at?: Date;
}

// Chapter interface
export interface Chapter {
  _id?: ObjectId | string; // Allow both ObjectId and string
  novel_id: ObjectId | string; // Allow both ObjectId and string for novel reference
  chapter_id: number | string; // Allow both number and string chapter IDs
  title: string;
  content: string;
  order: number;
  word_count: number;
  character_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChapterListItem {
  _id: ObjectId | string;
  chapter_id: number | string;
  title: string;
  order: number;
}

export interface ChapterWithNavigation extends Chapter {
  prev_chapter_id?: number | string;
  next_chapter_id?: number | string;
}