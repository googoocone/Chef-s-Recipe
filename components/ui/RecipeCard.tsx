'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Flame, Heart } from 'lucide-react';
import { Recipe } from '@/lib/placeholder-data';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
    return (
        <Link href={`/recipe/${recipe.id}`} className="block group h-full">
            <div className="relative bg-white rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 border border-gray-50 h-full flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm cursor-pointer hover:text-red-500 transition-colors z-10">
                        <Heart size={20} />
                    </div>
                    {recipe.isRecommended && (
                        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            HOT PICK
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                            {recipe.chefName} Chef
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {recipe.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between text-gray-500 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{recipe.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Flame size={16} className="text-orange-500" />
                            <span className="font-medium text-gray-700">{recipe.calories}kcal</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
