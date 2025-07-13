
'use client';

import { useState, useRef, MouseEvent, TouchEvent, useEffect } from 'react';
import type { Locale } from '@/i18n-config';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StoryModal } from './story-modal';
import { Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchStories, type Story } from '@/lib/story-data';

interface StoryViewerProps {
    dictionary: any;
    lang: Locale;
}

const REWARD_STORAGE_KEY = 'hami-reward-coins';

export function StoryViewer({ dictionary, lang }: StoryViewerProps) {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
    const [coins, setCoins] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);
    const storiesViewedInSession = useRef(new Set<string>());

    useEffect(() => {
        const getStories = async () => {
            setIsLoading(true);
            const fetchedStories = await fetchStories();
            setStories(fetchedStories);
            setIsLoading(false);
        };
        getStories();
    }, []);

    useEffect(() => {
        const storedCoins = localStorage.getItem(REWARD_STORAGE_KEY);
        if (storedCoins) {
            setCoins(parseInt(storedCoins, 10));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(REWARD_STORAGE_KEY, coins.toString());
    }, [coins]);

    const handleClose = () => {
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
        const walk = (x - startX) * 1.5;
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
                    <Coins className="h-6 w-6" />
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
                    {isLoading ? (
                         Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-28 h-40">
                                <Skeleton className="w-full h-full rounded-lg" />
                            </div>
                        ))
                    ) : (
                        stories.map((story, index) => (
                             <div 
                                key={story.id} 
                                onClick={() => handleStoryClick(index)} 
                                className="flex-shrink-0 group relative w-28 h-40 rounded-lg overflow-hidden cursor-pointer shadow-lg select-none"
                            >
                                <Image 
                                    src={story.avatar}
                                    alt={story.username}
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                                    data-ai-hint={story.avatarAiHint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg" />
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                    <p className="text-white text-xs font-bold truncate">{story.username}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {selectedStoryIndex !== null && stories.length > 0 && (
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
