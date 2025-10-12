"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTags, onTagToggle }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Button
          key={tag}
          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTagToggle(tag)}
          className={selectedTags.includes(tag) 
            ? 'bg-purple-600 hover:bg-purple-700' 
            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }
        >
          {tag}
        </Button>
      ))}
    </div>
  );
};

export default TagSelector;