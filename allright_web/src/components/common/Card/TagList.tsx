'use client';

import { motion } from 'framer-motion';

const CREATE_ANIMATION_CONFIG = (tagsLength: number) => ({
  x: [0, -100 * tagsLength]
});

const CREATE_TRANSITION_CONFIG = (tagsLength: number) => ({
  duration: tagsLength * 2,
  repeat: Infinity,
  ease: "linear" as const
});

interface TagListProps {
  tags: string[];
}

export const TagList = ({ tags }: TagListProps) => {
  const duplicatedTags = [...tags, ...tags];

  return (
    <div className="overflow-hidden">
      <motion.div 
        className="flex gap-2"
        animate={CREATE_ANIMATION_CONFIG(tags.length)}
        transition={CREATE_TRANSITION_CONFIG(tags.length)}
      >
        {duplicatedTags.map((tag, index) => (
          <span 
            key={index}
            className="rounded-lg bg-[var(--bg-34343A)] px-3 py-1.5 text-sm font-medium whitespace-nowrap"
          >
            # {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
};