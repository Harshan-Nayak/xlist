"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const categories = ["All", ...CATEGORIES];
  
  // Show limited categories on both mobile and desktop
  const categoryLimit = 8;
  const displayCategories = !showAll
    ? categories.slice(0, categoryLimit)
    : categories;
  
  const shouldShowShowAll = categories.length > categoryLimit;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
        {displayCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="text-xs sm:text-sm h-8 px-2 sm:px-3"
          >
            {category}
            {selectedCategory === category && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 px-1 py-0 text-xs">
                ✓
              </Badge>
            )}
          </Button>
        ))}
      </div>
      
      {shouldShowShowAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs sm:text-sm h-6 px-2 sm:px-3"
        >
          {showAll ? "Show less" : `Show all (${categories.length - categoryLimit} more)`}
        </Button>
      )}
    </div>
  );
}