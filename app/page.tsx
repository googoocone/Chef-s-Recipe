import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import ChefCategory from '@/components/ui/ChefCategory';
import RecipeCard from '@/components/ui/RecipeCard';
import RecipeSlider from '@/components/ui/RecipeSlider';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 0; // Disable caching for now to see fresh data

export default async function Home() {
  // 1. Fetch Chefs
  const { data: chefs } = await supabase
    .from('chefs')
    .select('id, name, image_url')
    .order('name');

  // Map to component expected shape
  const chefList = (chefs || []).map(c => ({
    id: c.id,
    name: c.name,
    image: c.image_url
  }));

  // 2. Fetch Recipes with Chef Name
  // Note: joining chefs table to get name
  const { data: recipes } = await supabase
    .from('recipes')
    .select(`
      id, title, image_url, time, calories, is_recommended, chef_id,
      chefs (name)
    `)
    .order('created_at', { ascending: false })
    .limit(12);

  // Map to component expected shape (RecipeCard expects a subset of Recipe type)
  // Casting 'any' here for the join result brevity, or strict typing if preferred.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recipeList = (recipes || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    chefId: r.chef_id,
    chefName: r.chefs?.name || 'Unknown Chef',
    image: r.image_url,
    time: r.time,
    calories: r.calories,
    isRecommended: r.is_recommended,
    videoUrl: '', // Not needed for card
    ingredients: [], // Not needed for card
    steps: [], // Not needed for card
    nutrition: { calories: r.calories, protein: '', fat: '', carbs: '' } // minimal
  }));

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 text-center overflow-hidden">
        <SearchBar />
      </section>

      {/* Chef Categories */}
      <section className="mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <span className="text-orange-600 font-bold tracking-wider text-sm uppercase mb-2 block">Master Chefs</span>
              <h2 className="text-3xl font-bold text-gray-900">최고의 셰프들</h2>
            </div>
            <Link href="#" className="text-sm font-semibold text-gray-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
              전체보기 <ArrowRight size={16} />
            </Link>
          </div>
          <ChefCategory chefs={chefList} />
        </div>
      </section>

      {/* Popular Recipes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <span className="text-orange-600 font-bold tracking-wider text-sm uppercase mb-2 block">Trending Now</span>
            <h2 className="text-3xl font-bold text-gray-900">이번 주 인기 레시피</h2>
          </div>
        </div>

        <RecipeSlider recipes={recipeList} />

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all border border-gray-100">
            더 많은 레시피 보기
          </button>
        </div>
      </section>
    </div>
  );
}
