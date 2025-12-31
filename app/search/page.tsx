
import { supabase } from '@/lib/supabase/client';
import ChefCategory from '@/components/ui/ChefCategory';
import RecipeCard from '@/components/ui/RecipeCard';
import Link from 'next/link';
import { ArrowLeft, SearchX, ChefHat, Utensils } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const revalidate = 0;

interface SearchPageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function SearchPage(props: SearchPageProps) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';

    // Parallel Fetching: Chefs and Recipes
    const [chefsResult, recipesResult] = await Promise.all([
        supabase.from('chefs').select('*').ilike('name', `%${query}%`).order('name'),
        supabase.from('recipes')
            .select('*, chefs(name)')
            .ilike('title', `%${query}%`)
            .order('created_at', { ascending: false })
    ]);

    const chefs = chefsResult.data || [];
    const recipes = recipesResult.data || [];

    // Map recipes to component props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipeList = recipes.map((r: any) => ({
        id: r.id,
        title: r.title,
        chefId: r.chef_id,
        chefName: r.chefs?.name || 'Unknown Chef',
        image: r.image_url,
        time: r.time,
        calories: r.calories,
        isRecommended: r.is_recommended,
        videoUrl: '',
        ingredients: [],
        steps: [],
        nutrition: { calories: r.calories, protein: '', fat: '', carbs: '' }
    }));

    const hasResults = chefs.length > 0 || recipes.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Search Results</p>
                            <h1 className="text-2xl font-black text-gray-900">
                                "{query}" <span className="text-gray-400 font-medium">검색 결과</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-16">

                {!hasResults && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-6 animate-pulse">
                            <SearchX size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">검색 결과가 없습니다.</h2>
                        <p className="text-gray-500">다른 키워드로 검색해보거나, 철자를 확인해주세요.</p>
                    </div>
                )}

                {/* 1. Matched Chefs */}
                {chefs.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-6 text-orange-600">
                            <ChefHat size={20} />
                            <h2 className="text-xl font-bold text-gray-900">관련 셰프 <span className="text-gray-400 text-sm ml-1">{chefs.length}</span></h2>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            {/* Reusing ChefCategory for consistent look */}
                            <ChefCategory chefs={chefs.map(c => ({ id: c.id, name: c.name, image: c.image_url }))} />
                        </div>
                    </section>
                )}

                {/* 2. Matched Recipes */}
                {recipes.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-6 text-orange-600">
                            <Utensils size={20} />
                            <h2 className="text-xl font-bold text-gray-900">관련 레시피 <span className="text-gray-400 text-sm ml-1">{recipes.length}</span></h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recipeList.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
