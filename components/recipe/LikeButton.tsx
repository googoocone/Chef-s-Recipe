'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    recipeId: string;
    initialCount: number;
    initialIsLiked: boolean;
}

export default function LikeButton({ recipeId, initialCount, initialIsLiked }: LikeButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleToggleLike = async () => {
        if (isLoading) return;

        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            if (confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
                router.push('/login');
            }
            return;
        }

        setIsLoading(true);

        // Optimistic UI
        const previousLiked = isLiked;
        const previousCount = count;

        setIsLiked(!previousLiked);
        setCount(previousLiked ? previousCount - 1 : previousCount + 1);

        try {
            if (previousLiked) {
                // Unlike
                const { error } = await supabase
                    .from('recipe_likes')
                    .delete()
                    .eq('recipe_id', recipeId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Like
                const { error } = await supabase
                    .from('recipe_likes')
                    .insert({ recipe_id: recipeId, user_id: user.id });

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert
            setIsLiked(previousLiked);
            setCount(previousCount);
            alert('좋아요 처리에 실패했습니다.');
        } finally {
            setIsLoading(false);
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleToggleLike}
            disabled={isLoading}
            className={`
                flex flex-col items-center justify-center gap-1 min-w-[60px] p-2 rounded-xl transition-all
                ${isLiked
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-red-400 hover:bg-gray-50'
                }
            `}
        >
            <Heart
                size={24}
                fill={isLiked ? "currentColor" : "none"}
                className={`transition-transform duration-200 ${isLiked ? 'scale-110' : 'scale-100'}`}
            />
            <span className={`text-xs font-bold ${isLiked ? 'text-red-600' : 'text-gray-500'}`}>
                {count > 999 ? '999+' : count}
            </span>
        </button>
    );
}
