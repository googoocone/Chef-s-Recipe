import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import RecipeCard from '@/components/ui/RecipeCard';
import { ChefHat, ArrowLeft } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ChefPage(props: PageProps) {
    const params = await props.params;

    // 1. Fetch Chef Details
    const { data: chef, error: chefError } = await supabase
        .from('chefs')
        .select('*')
        .eq('id', params.id)
        .single();

    if (chefError || !chef) {
        notFound();
    }

    // 2. Fetch Chef's Recipes
    const { data: recipes, error: recipeError } = await supabase
        .from('recipes')
        .select(`
            id, title, image_url, time, calories, is_recommended, chef_id
        `)
        .eq('chef_id', params.id)
        .order('created_at', { ascending: false });

    if (recipeError) {
        console.error('Recipe Fetch Error:', recipeError);
    }

    // Map recipes to component props (adding missing chefName for card since we know the chef)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipeList = (recipes || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        chefId: chef.id,
        chefName: chef.name,
        image: r.image_url,
        time: r.time,
        calories: r.calories,
        isRecommended: r.is_recommended,
        videoUrl: '',
        ingredients: [],
        steps: [],
        nutrition: { calories: r.calories, protein: '', fat: '', carbs: '' }
    }));

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Profile Section */}
            <div className="relative bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
                    <Link href="/" className="absolute top-8 left-4 md:left-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={16} /> 메인으로
                    </Link>

                    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl">
                        <Image
                            src={chef.image_url}
                            alt={chef.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 text-orange-700 font-bold text-xs uppercase tracking-wider mb-4">
                        <ChefHat size={14} />
                        <span>Master Chef</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        {chef.name}
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
                        대한민국을 대표하는 셰프 {chef.name}님의 특별한 레시피를 만나보세요.
                    </p>
                </div>
            </div>

            {/* Recipe Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-20">
                <div className="flex items-end justify-between mb-10 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {chef.name} 셰프의 레시피 <span className="text-orange-600 ml-1">{recipeList.length}</span>
                    </h2>
                </div>

                {recipeList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recipeList.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl">
                        <p className="text-gray-400">아직 등록된 레시피가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
