
'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { StoryProgress } from './story-progress';
import type { Story, StoryContent } from './story-viewer';
import Image from 'next/image';
import type { Locale } from '@/i18n-config';

const STORY_DURATION = 5000; // 5 seconds

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
  const dragControls = useDragControls();

  const currentStory = stories[currentStoryIndex];

  // Fix: Add a guard clause to prevent rendering if currentStory is undefined.
  // This can happen during rapid transitions or on close, preventing a crash.
  if (!currentStory) {
    return null;
  }

  const goToNextPage = useCallback(() => {
    setCurrentPageIndex(prev => {
      if (prev < currentStory.content.length - 1) {
        return prev + 1;
      }
      // If on the last page of a story, go to the next story
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(prevIdx => prevIdx + 1);
        return 0; // Reset to the first page of the new story
      }
      onClose(); // Close if it's the absolute last page
      return prev;
    });
  }, [currentStory, currentStoryIndex, stories.length, onClose]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPageIndex(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      // If on the first page, go to previous story
      if (currentStoryIndex > 0) {
        const prevStory = stories[currentStoryIndex - 1];
        setCurrentStoryIndex(prevIdx => prevIdx - 1);
        return prevStory.content.length - 1; // Go to the last page of the previous story
      }
      return 0; // Stay on the first page if it's the first story
    });
  }, [currentStoryIndex, stories]);

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose(); // Close modal if it's the last story
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  }, [currentStoryIndex]);


  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      goToNextPage();
    }, STORY_DURATION);

    return () => clearTimeout(timer);
  }, [currentPageIndex, currentStoryIndex, isPaused, goToNextPage]);
  
  // Reset page index when story changes via swipe/buttons
  useEffect(() => {
      setCurrentPageIndex(0);
  }, [currentStoryIndex]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const tapPosition = (clientX - left) / width;
    
    // In RTL, right side is for previous, left for next
    if (lang === 'fa') {
      if (tapPosition < 0.3) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }
    } else { // LTR
      if (tapPosition > 0.7) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }
    }
  };
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      goToPreviousStory();
    } else if (offset < -100 || velocity < -500) {
      goToNextStory();
    }
  };

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
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Main content with animation for swipe */}
          <AnimatePresence initial={false} custom={currentStoryIndex}>
            <motion.div
              key={currentStoryIndex}
              className="absolute inset-0"
              drag="x"
              dragControls={dragControls}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <StoryContentDisplay content={currentStory.content[currentPageIndex]} />
            </motion.div>
          </AnimatePresence>

          {/* Overlays */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-6 z-10">
              <StoryProgress
                storyCount={currentStory.content.length}
                currentPageIndex={currentPageIndex}
                duration={STORY_DURATION}
                isPaused={isPaused}
              />
              <div className="flex items-center space-x-3 mt-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={currentStory.avatar} alt={currentStory.username} data-ai-hint={currentStory.avatarAiHint} />
                  <AvatarFallback>{currentStory.username.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm">{currentStory.username}</span>
              </div>
            </div>

            {/* Tap navigation zones */}
            <div className="flex-1 w-full" onClick={handleTap} style={{ pointerEvents: 'auto' }}></div>
          </div>
          
          {/* Navigation Buttons (for desktop) & Close button */}
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 hover:text-white" onClick={onClose}>
            <X />
          </Button>
          <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 left-2 z-20 text-white hover:bg-white/20 hover:text-white hidden md:flex" onClick={goToPreviousStory} disabled={currentStoryIndex === 0}>
            <ChevronLeft />
          </Button>
           <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 z-20 text-white hover:bg-white/20 hover:text-white hidden md:flex" onClick={goToNextStory} disabled={currentStoryIndex === stories.length - 1}>
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
            <Image
                src={content.url}
                alt={content.header}
                fill
                className="object-cover"
                data-ai-hint={content.aiHint}
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold">{content.header}</h3>
                <p className="mt-1 text-sm">{content.text}</p>
            </div>
        </div>
    );
};
