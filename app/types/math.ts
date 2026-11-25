export interface Chapter {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sort_order: number;
  created_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Concept {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  intuition: string;
  explanation: string;
  key_takeaway: string;
  created_at: string;
  updated_at: string;
}

export interface ChapterWithCounts extends Chapter {
  topic_count: number;
  concept_count: number;
}

export interface TopicWithConcepts extends Topic {
  concepts: Concept[];
}