'use client';

import { useRef } from 'react';
import RecipeCard from './RecipeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Recipe } from '@/lib/placeholder-data';

interface RecipeSliderProps {
    recipes: Recipe[];
}

export default function RecipeSlider({ recipes }: RecipeSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth; // Scroll one full view width
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group/slider">
            {/* Scroll Buttons (Desktop Only - visible on hover) */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg border border-gray-100 text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white hover:scale-110 active:scale-95"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg border border-gray-100 text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-white hover:scale-110 active:scale-95"
            >
                <ChevronRight size={24} />
            </button>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="flex-none w-[calc(50%-8px)] md:w-[calc(25%-18px)] snap-start"
                    >
                        <RecipeCard recipe={recipe} />
                    </div>
                ))}
            </div>
        </div>
    );
}
