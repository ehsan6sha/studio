
'use client';

import { useState, useRef, MouseEvent, TouchEvent, useEffect } from 'react';
import type { Locale } from '@/i18n-config';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoryModal } from './story-modal';
import { Coin } from 'lucide-react';

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
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'nature calm', header: 'Welcome!', text: 'Discover daily tips for mental wellness.' },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'meditation calm', header: 'Mindfulness', text: 'Take 5 minutes to breathe deeply.' },
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
   {
    id: 'user5',
    username: 'MindfulEats',
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'vegetables fruits',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'healthy food', header: 'Eat Mindfully', text: 'Pay attention to the food you eat and enjoy every bite.' },
    ],
  },
  {
    id: 'user6',
    username: 'SocialConnect',
    avatar: 'https://placehold.co/100x100.png',
    avatarAiHint: 'friends talking',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'people community', header: 'Connect with Others', text: 'Reach out to a friend or family member today.' },
    ],
  },
];


interface StoryViewerProps {
    dictionary: any;
    lang: Locale;
}

const REWARD_STORAGE_KEY = 'hami-reward-coins';

export function StoryViewer({ dictionary, lang }: StoryViewerProps) {
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
    const [coins, setCoins] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);
    const storiesViewedInSession = useRef(new Set<string>());

    // Load coins from local storage on mount
    useEffect(() => {
        const storedCoins = localStorage.getItem(REWARD_STORAGE_KEY);
        if (storedCoins) {
            setCoins(parseInt(storedCoins, 10));
        }
    }, []);

    // Save coins to local storage when they change
    useEffect(() => {
        localStorage.setItem(REWARD_STORAGE_KEY, coins.toString());
    }, [coins]);

    const handleClose = () => {
        // Award a coin only if the story group hasn't been viewed in this session
        if (selectedStoryIndex !== null) {
            const storyId = stories[selectedStoryIndex].id;
            if (!storiesViewedInSession.current.has(storyId)) {
                setCoins(prevCoins => prevCoins + 1);
                storiesViewedInSession.current.add(storyId);
            }
        }
        setSelectedStoryIndex(null);
    };

    const handleDragStart = (pageX: number, currentScrollLeft: number) => {
        setIsDragging(true);
        setHasDragged(false);
        setStartX(pageX);
        setScrollLeft(currentScrollLeft);
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grabbing';
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
        }
    };

    const handleDragMove = (pageX: number) => {
        if (!isDragging || !scrollRef.current) return;
        if (!hasDragged) setHasDragged(true);
        const x = pageX;
        const walk = (x - startX) * 1.5; // Drag speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };
    
    const handleStoryClick = (index: number) => {
        if (hasDragged) return;
        setSelectedStoryIndex(index);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{dictionary.title}</CardTitle>
                <div className="flex items-center gap-2 text-amber-500" aria-label={`${coins} ${dictionary.rewardPointsLabel || 'reward points'}`}>
                    <Coin className="h-6 w-6" />
                    <span className="font-bold text-lg">{coins}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div 
                    ref={scrollRef}
                    className="flex gap-4 pb-4 overflow-x-auto cursor-grab active:cursor-grabbing"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onMouseDown={(e: MouseEvent<HTMLDivElement>) => handleDragStart(e.pageX, e.currentTarget.scrollLeft)}
                    onMouseLeave={handleDragEnd}
                    onMouseUp={handleDragEnd}
                    onMouseMove={(e: MouseEvent<HTMLDivElement>) => handleDragMove(e.pageX)}
                    onTouchStart={(e: TouchEvent<HTMLDivElement>) => handleDragStart(e.touches[0].pageX, e.currentTarget.scrollLeft)}
                    onTouchEnd={handleDragEnd}
                    onTouchMove={(e: TouchEvent<HTMLDivElement>) => handleDragMove(e.touches[0].pageX)}
                >
                    {stories.map((story, index) => (
                         <div 
                            key={story.id} 
                            onClick={() => handleStoryClick(index)} 
                            className="flex-shrink-0 group relative w-28 h-40 rounded-lg overflow-hidden cursor-pointer shadow-lg select-none"
                        >
                            <Image 
                                src={story.content[0].url}
                                alt={story.username}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                                data-ai-hint={story.content[0].aiHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-xs font-bold truncate">{story.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
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
