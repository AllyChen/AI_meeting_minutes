export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  rawText: string;
  processedText: string;
  tone: string;
  targetLanguage: string;
  sections: string[];
}

export interface GenerationConfig {
  transcript: string;
  targetLanguage: string;
  tone: string;
  sections: string[];
}

export interface SampleTranscript {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}
