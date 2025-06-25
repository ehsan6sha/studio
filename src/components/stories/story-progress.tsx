
'use client';

import { motion } from 'framer-motion';

interface StoryProgressProps {
  storyCount: number;
  currentPageIndex: number;
  duration: number;
  isPaused: boolean;
}

export function StoryProgress({ storyCount, currentPageIndex, duration, isPaused }: StoryProgressProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {Array.from({ length: storyCount }).map((_, i) => (
        <div key={i} className="flex-1 h-1 bg-white/40 rounded-full overflow-hidden">
          {i < currentPageIndex ? (
            <div className="h-full w-full bg-white" />
          ) : i === currentPageIndex ? (
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              // By including all state dependencies in the key, we force a re-mount
              // and thus a re-animation whenever the page or pause state changes.
              key={`${currentPageIndex}-${isPaused}`}
            />
          ) : (
            <div className="h-full w-0 bg-white" />
          )}
        </div>
      ))}
    </div>
  );
}
