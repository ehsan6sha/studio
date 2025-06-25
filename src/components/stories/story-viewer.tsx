
'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n-config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'logo abstract',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'inspirational quote', header: 'Welcome!', text: 'Discover daily tips for mental wellness.' },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'calm meditation', header: 'Mindfulness', text: 'Take 5 minutes to breathe deeply.' },
    ],
  },
  {
    id: 'user2',
    username: 'Dr. Ahmadi',
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'professional portrait',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'psychology book', header: 'Cognitive Biases', text: 'Learn how your thoughts can trick you. Today, we look at confirmation bias.' },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'journal writing', header: 'Journaling Tip', text: 'Try writing down three things you are grateful for each day.' },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'brain illustration', header: 'Neuroplasticity', text: 'Your brain can change and adapt, no matter your age.' },
    ],
  },
  {
    id: 'user3',
    username: 'HealthyHabits',
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'healthy food',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'running shoes', header: 'Move Your Body', text: 'Even a 15-minute walk can boost your mood.' },
    ],
  },
  {
    id: 'user4',
    username: 'SleepWell',
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'moon stars',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'bedroom night', header: 'Sleep Hygiene', text: 'Avoid screens for at least an hour before bed for better sleep quality.' },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'cup tea', header: 'Herbal Tea', text: 'Chamomile tea can help you relax before sleeping.' },
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
                            <div key={story.id} onClick={() => setSelectedStoryIndex(index)} className="flex-shrink-0 flex flex-col items-center space-y-1 cursor-pointer w-20 text-center">
                                <div className="relative h-16 w-16 rounded-full p-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                                    <Avatar className="h-full w-full border-2 border-card">
                                        <AvatarImage src={story.avatar} alt={story.username} data-ai-hint={story.avatarAiHint} />
                                        <AvatarFallback>{story.username.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <p className="text-xs font-medium truncate w-full">{story.username}</p>
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
                    />
                )}
            </CardContent>
        </Card>
    )
}
