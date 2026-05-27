export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  rawText: string;
  processedText: string;
}

export interface GenerationConfig {
  transcript: string;
  customInstruction?: string;
}

export interface SampleTranscript {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}
