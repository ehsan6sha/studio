'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n-config';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StoryModal } from './story-modal';

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

// Demo Data
const stories: Story[] = [
  {
    id: 'user1',
    username: 'RavanHamrah',
    avatar: 'https://source.unsplash.com/100x100/?logo,abstract',
    avatarAiHint: 'logo abstract',
    content: [
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?nature,calm', aiHint: 'nature calm', header: 'Welcome!', text: 'Discover daily tips for mental wellness.' },
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?meditation,calm', aiHint: 'calm meditation', header: 'Mindfulness', text: 'Take 5 minutes to breathe deeply.' },
    ],
  },
  {
    id: 'user2',
    username: 'Dr. Ahmadi',
    avatar: 'https://source.unsplash.com/100x100/?portrait,doctor',
    avatarAiHint: 'professional portrait',
    content: [
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?psychology,book', aiHint: 'psychology book', header: 'Cognitive Biases', text: 'Learn how your thoughts can trick you. Today, we look at confirmation bias.' },
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?journal,writing', aiHint: 'journal writing', header: 'Journaling Tip', text: 'Try writing down three things you are grateful for each day.' },
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?brain,illustration', aiHint: 'brain illustration', header: 'Neuroplasticity', text: 'Your brain can change and adapt, no matter your age.' },
    ],
  },
  {
    id: 'user3',
    username: 'HealthyHabits',
    avatar: 'https://source.unsplash.com/100x100/?healthy,food',
    avatarAiHint: 'healthy food',
    content: [
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?running,shoes', aiHint: 'running shoes', header: 'Move Your Body', text: 'Even a 15-minute walk can boost your mood.' },
    ],
  },
  {
    id: 'user4',
    username: 'SleepWell',
    avatar: 'https://source.unsplash.com/100x100/?moon,stars',
    avatarAiHint: 'moon stars',
    content: [
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?bedroom,night', aiHint: 'bedroom night', header: 'Sleep Hygiene', text: 'Avoid screens for at least an hour before bed for better sleep quality.' },
      { type: 'image', url: 'https://source.unsplash.com/1080x1920/?tea,cup', aiHint: 'cup tea', header: 'Herbal Tea', text: 'Chamomile tea can help you relax before sleeping.' },
    ],
  },
];


interface StoryViewerProps {
    dictionary: any;
    lang: Locale;
}

export function StoryViewer({ dictionary, lang }: StoryViewerProps) {
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const handleClose = () => {
        setSelectedStoryIndex(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dictionary.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                        {stories.map((story, index) => (
                             <div 
                                key={story.id} 
                                onClick={() => setSelectedStoryIndex(index)} 
                                className="flex-shrink-0 group relative w-28 h-40 rounded-lg overflow-hidden cursor-pointer shadow-lg"
                            >
                                <Image 
                                    src={story.content[0].url}
                                    alt={story.username}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    data-ai-hint={story.content[0].aiHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p className="text-white text-xs font-bold truncate">{story.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                {selectedStoryIndex !== null && (
                    <StoryModal
                        stories={stories}
                        initialStoryIndex={selectedStoryIndex}
                        onClose={handleClose}
                        lang={lang}
                        title={dictionary.title}
                    />
                )}
            </CardContent>
        </Card>
    )
}
