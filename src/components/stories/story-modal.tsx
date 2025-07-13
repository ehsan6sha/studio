
'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnimatePresence, motion, TapInfo, PanInfo } from 'framer-motion';
import { StoryProgress } from './story-progress';
import type { Story, StoryContent } from '@/lib/story-data';
import Image from 'next/image';
import type { Locale } from '@/i18n-config';

const STORY_DEFAULT_DURATION = 5000; // 5 seconds

interface StoryModalProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  lang: Locale;
  title: string;
}

export function StoryModal({ stories, initialStoryIndex, onClose, lang, title }: StoryModalProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentStoryIndex];

  const goToNextPage = useCallback(() => {
    const story = stories[currentStoryIndex];
    if (!story) return;

    if (currentPageIndex < story.content.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentPageIndex(0);
    } else {
      onClose();
    }
  }, [currentPageIndex, currentStoryIndex, stories, onClose]);

  const goToPreviousPage = useCallback(() => {
     if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else if (currentStoryIndex > 0) {
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentPageIndex(prevStory.content.length - 1);
    }
  }, [currentPageIndex, currentStoryIndex, stories]);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentPageIndex(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentPageIndex(0);
    }
  }, [currentStoryIndex]);

  useEffect(() => {
    if (isPaused) return;

    const content = stories[currentStoryIndex]?.content[currentPageIndex];
    if (!content) return;

    // Use dynamic duration if available, otherwise default. For both video and image.
    const duration = (content.duration ? content.duration * 1000 : STORY_DEFAULT_DURATION);

    const timer = setTimeout(goToNextPage, duration);
    return () => clearTimeout(timer);
  }, [currentPageIndex, currentStoryIndex, isPaused, goToNextPage, stories]);

  useEffect(() => {
      setCurrentPageIndex(0);
  }, [currentStoryIndex]);

  if (!currentStory) {
    return null;
  }
  
  const handleTap = (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => {
    // Prevent tap event from firing on buttons
    if (event.target instanceof HTMLElement && event.target.closest('button')) {
      return;
    }
    
    // Use the element that the event listener is attached to
    const targetElement = event.currentTarget as HTMLElement;
    if (!targetElement) return;

    const { left, width } = targetElement.getBoundingClientRect();
    const tapPosition = (info.point.x - left) / width;
    
    if (lang === 'fa') {
      if (tapPosition < 0.3) { goToNextPage(); } 
      else { goToPreviousPage(); }
    } else { // LTR
      if (tapPosition > 0.7) { goToNextPage(); } 
      else { goToPreviousPage(); }
    }
     // After tap, resume animations/timer
    setIsPaused(false);
  };
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsPaused(false); // Always resume on drag end

    const swipeThreshold = 50;
    const velocityThreshold = 200;

    const { offset, velocity } = info;

    const isHorizontalSwipe = Math.abs(offset.x) > Math.abs(offset.y);

    if (isHorizontalSwipe) {
      // Horizontal swipe
      const swipe = lang === 'fa' ? offset.x * -1 : offset.x; // Invert for RTL
      if (swipe < -swipeThreshold || velocity.x < -velocityThreshold) {
        goToNextStory();
      } else if (swipe > swipeThreshold || velocity.x > velocityThreshold) {
        goToPreviousStory();
      }
    } else {
      // Vertical swipe to dismiss
      if (offset.y > swipeThreshold * 1.5 || velocity.y > velocityThreshold) {
        onClose();
      }
    }
  };
  
  const currentPageContent = currentStory.content[currentPageIndex];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="bg-black/90 border-none p-0 w-screen h-screen max-w-full max-h-full sm:rounded-none flex items-center justify-center overflow-hidden"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            A full-screen story viewer. Navigate by tapping or swiping.
          </DialogDescription>
        </DialogHeader>
        <div 
          className="relative w-full h-full max-w-[420px] max-h-[95vh] flex flex-col bg-black rounded-lg overflow-hidden select-none"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={currentStoryIndex}
              className="absolute inset-0"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsPaused(true)}
              onDragEnd={handleDragEnd}
              onTapStart={() => setIsPaused(true)}
              onTapCancel={() => setIsPaused(false)}
              onTap={handleTap}
              initial={{ x: lang === 'fa' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'fa' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {currentPageContent && <StoryContentDisplay content={currentPageContent} />}
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-10">
              <StoryProgress
                storyCount={currentStory.content.length}
                currentPageIndex={currentPageIndex}
                duration={(currentStory.content[currentPageIndex]?.duration || 5) * 1000}
                isPaused={isPaused}
              />
              <div className="flex items-center space-x-3 rtl:space-x-reverse mt-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={currentStory.avatar} alt={currentStory.username} data-ai-hint={currentStory.avatarAiHint} unoptimized />
                  <AvatarFallback>{currentStory.username.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm">{currentStory.username}</span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 hover:text-white pointer-events-auto" onClick={onClose}>
            <X />
          </Button>
          <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 left-2 z-20 text-white hover:bg-white/20 hover:text-white hidden md:flex pointer-events-auto" onClick={goToPreviousStory} disabled={currentStoryIndex === 0}>
            <ChevronLeft />
          </Button>
           <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 z-20 text-white hover:bg-white/20 hover:text-white hidden md:flex pointer-events-auto" onClick={goToNextStory} disabled={currentStoryIndex === stories.length - 1}>
            <ChevronRight />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const StoryContentDisplay = ({ content }: { content: StoryContent }) => {
    return (
        <div className="relative w-full h-full">
            {content.type === 'video' ? (
                 <video
                    key={content.url}
                    src={content.url}
                    className="object-cover w-full h-full"
                    autoPlay
                    muted
                    playsInline
                    loop
                />
            ) : (
                <Image
                    src={content.url}
                    alt={content.header}
                    fill
                    unoptimized
                    className="object-cover"
                    data-ai-hint={content.aiHint}
                    priority
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold">{content.header}</h3>
                <p className="mt-1 text-sm">{content.text}</p>
            </div>
        </div>
    );
};
