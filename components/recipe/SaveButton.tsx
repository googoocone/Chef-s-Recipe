'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface SaveButtonProps {
    recipeId: string;
    initialIsSaved: boolean;
}

export default function SaveButton({ recipeId, initialIsSaved }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleToggleSave = async () => {
        if (isLoading) return;

        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            if (confirm('저장하려면 로그인이 필요합니다. 로그인 하시겠습니까?')) {
                router.push('/login');
            }
            return;
        }

        setIsLoading(true);

        // Optimistic UI
        const previousSaved = isSaved;
        setIsSaved(!previousSaved);

        try {
            if (previousSaved) {
                // Unsave
                const { error } = await supabase
                    .from('recipe_saves')
                    .delete()
                    .eq('recipe_id', recipeId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Save
                const { error } = await supabase
                    .from('recipe_saves')
                    .insert({ recipe_id: recipeId, user_id: user.id });

                if (error) throw error;
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            // Revert
            setIsSaved(previousSaved);
            alert('저장 처리에 실패했습니다.');
        } finally {
            setIsLoading(false);
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`
                flex flex-col items-center justify-center gap-1 min-w-[60px] p-2 rounded-xl transition-all
                ${isSaved
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50'
                }
            `}
        >
            <Bookmark
                size={24}
                fill={isSaved ? "currentColor" : "none"}
                className={`transition-transform duration-200 ${isSaved ? 'scale-110' : 'scale-100'}`}
            />
            <span className={`text-xs font-bold ${isSaved ? 'text-blue-600' : 'text-gray-500'}`}>
                {isSaved ? 'Saved' : 'Save'}
            </span>
        </button>
    );
}
