
import storiesData from '@/data/stories.json';

export interface StoryContent {
  type: 'image' | 'video';
  url: string;
  duration?: number; // in seconds
  header: string;
  text: string;
  aiHint?: string;
}

export interface Story {
  id: string;
  username: string;
  avatar: string;
  avatarAiHint?: string;
  content: StoryContent[];
}

// Type for the raw data from JSON to ensure type safety during mapping
interface RawStoryContent {
  order: number;
  url: string;
  header: string;
  text: string;
  time: number; // in ms
  aiHint?: string;
}

interface RawStory {
  id: string;
  name: string;
  thumbnail: string;
  avatarAiHint?: string;
  content: RawStoryContent[];
}

const isVideo = (url: string): boolean => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.endsWith('.webm');
};

const mapRawDataToStories = (rawData: RawStory[]): Story[] => {
  return rawData.map(rawStory => ({
    id: rawStory.id,
    username: rawStory.name,
    avatar: rawStory.thumbnail,
    avatarAiHint: rawStory.avatarAiHint,
    content: rawStory.content
      .sort((a, b) => a.order - b.order)
      .map(rawContent => ({
        type: isVideo(rawContent.url) ? 'video' : 'image',
        url: rawContent.url,
        duration: rawContent.time / 1000, // convert ms to s
        header: rawContent.header,
        text: rawContent.text,
        aiHint: rawContent.aiHint,
      })),
  }));
};

// This function simulates fetching from a database, but now reads from the local JSON file.
export const fetchStories = (): Promise<Story[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // The JSON import is already an array of objects, we can cast it
      const typedStoriesData = storiesData as unknown as RawStory[];
      const mappedData = mapRawDataToStories(typedStoriesData);
      resolve(mappedData);
    }, 1000); // Simulate 1 second network delay
  });
};
